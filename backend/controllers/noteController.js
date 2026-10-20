const mongoose = require("mongoose");
const Note = require("../models/Note");
const ActivityLog = require("../models/ActivityLog");

// GET /api/notes
const getNotes = async (req, res) => {
  const query = { archived: req.query.archived === "true" };

  if (req.query.folder && req.query.folder !== "All") {
    query.folder = req.query.folder;
  }
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  if (req.query.search) {
    const s = String(req.query.search).trim();
    if (s) {
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { content: { $regex: s, $options: "i" } },
        { tags: { $in: [new RegExp(s, "i")] } },
      ];
    }
  }

  const notes = await Note.find(query).sort({ pinned: -1, updated_at: -1 }).lean();

  const transformed = notes.map((n) => {
    n.id = String(n._id);
    delete n._id;
    delete n.__v;
    return n;
  });

  res.json(transformed);
};

// POST /api/notes
const createNote = async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required" });

  const note = await Note.create({
    title: title.slice(0, 200),
    content: typeof req.body.content === "string" ? req.body.content : "",
    folder: typeof req.body.folder === "string" && req.body.folder.trim() ? req.body.folder.trim() : "General",
    tags: Array.isArray(req.body.tags) ? req.body.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    pinned: Boolean(req.body.pinned),
    project_id: mongoose.isValidObjectId(req.body.project_id) ? req.body.project_id : null,
  });

  ActivityLog.create({
    action: "note_created",
    description: `Created note "${note.title}"`,
    entity_type: "note",
    entity_id: String(note._id),
  }).catch(() => {});

  res.status(201).json(note);
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Note not found" });
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });

  if (req.body.title !== undefined) {
    const t = String(req.body.title).trim();
    if (t) note.title = t.slice(0, 200);
  }
  if (req.body.content !== undefined) {
    note.content = String(req.body.content);
  }
  if (req.body.folder !== undefined) {
    const f = String(req.body.folder).trim();
    if (f) note.folder = f;
  }
  if (Array.isArray(req.body.tags)) {
    note.tags = req.body.tags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (req.body.pinned !== undefined) {
    note.pinned = Boolean(req.body.pinned);
  }
  if (req.body.archived !== undefined) {
    note.archived = Boolean(req.body.archived);
  }
  if (req.body.project_id !== undefined) {
    note.project_id = mongoose.isValidObjectId(req.body.project_id) ? req.body.project_id : null;
  }

  await note.save();
  res.json(note);
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Note not found" });
  const deleted = await Note.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Note not found" });

  ActivityLog.create({
    action: "note_deleted",
    description: `Deleted note "${deleted.title}"`,
    entity_type: "note",
    entity_id: String(deleted._id),
  }).catch(() => {});

  res.status(204).end();
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
