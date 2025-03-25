const asyncHandler = require('express-async-handler');
const Lead = require('../models/leadModel');

/**
 * Get all leads for a given userId
 * GET /api/lead/user/:userId
 */
const getLeads = asyncHandler(async (req, res) => {
  const { userId } = req.params; // from "router.route('/user/:userId')"

  try {
    const leads = await Lead.find({ ownerId: userId });
    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads for user", error });
  }
});

/**
 * Add a new lead for a user
 * POST /api/lead/user/:userId
 */
const addLead = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phone, company, notes } = req.body;


  try {
    const newLead = await Lead.create({
      firstName,
      lastName,
      email,
      phone,
      notes,
      company,
      ownerId: userId,
    });
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ message: "Error adding lead", error });
  }
});

/**
 * Get a lead by leadId
 * GET /api/lead/one/:leadId
 */
const getLeadById = asyncHandler(async (req, res) => {
  const { leadId } = req.params; // from "router.route('/one/:leadId')"

  try {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Force fresh data (avoid 304)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lead", error });
  }
});

/**
 * Update a lead by leadId
 * PUT /api/lead/one/:leadId
 */
const updateLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  try {
    // If you want to ensure the user is the owner, pass in userId from auth:
    // e.g. const lead = await Lead.findOne({ _id: leadId, ownerId: req.user.id });
    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    // Update the lead with the provided fields
    Object.keys(req.body).forEach((key) => {
      lead[key] = req.body[key] || lead[key];
    });

    const updatedLead = await lead.save();
    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: "Error updating lead", error });
  }
});

/**
 * Delete a lead
 * (not currently used in the routes above, but you could do 
 *  DELETE /api/lead/one/:leadId with a router.delete('/one/:leadId', ...))
 */
const deleteLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  // If you want to ensure user is owner, do findOne
  const lead = await Lead.findById(leadId);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found or not authorized.');
  }
  await lead.deleteOne();
  res.status(200).json({ message: 'Lead deleted successfully.' });
});


// const uploadLeadNote = asyncHandler(async (req, res) => {
//   console.log('Request body:', req.body);
//   console.log('Request file:', req.file);
//   console.log('Request files:', req.files);
  
//   try {
//     const { leadId } = req.params;
//     const { text } = req.body;

//     // Enhanced error handling for file/text validation
//     if (!text && !req.file) {
//       console.log('No text or file provided in request.');
//       return res.status(400).json({ message: 'No text or file provided.' });
//     }

//     // Find the lead
//     const lead = await Lead.findById(leadId);
//     if (!lead) {
//       return res.status(404).json({ message: 'Lead not found.' });
//     }

//     // Ensure notes array exists
//     if (!Array.isArray(lead.notes)) {
//       lead.notes = [];
//     }

//     // Create a new note object
//     const note = {
//       createdAt: new Date(),
//     };

//     // Add text if provided
//     if (text) {
//       note.text = text;
//     }

//     // Add file details if a file is uploaded
//     if (req.file) {
//       note.fileUrl = req.file.location; // File URL from S3
//       note.fileName = req.file.originalname; // Original file name
//       note.fileType = req.file.mimetype; // MIME type
//       note.fileSize = req.file.size; // File size
//     }

//     // Push the note to the notes array
//     lead.notes.push(note);

//     // Save the updated lead
//     await lead.save();

//     // Return success response
//     res.status(201).json({
//       message: 'Note added successfully.',
//       note,
//       lead,
//     });
//   } catch (error) {
//     console.error('Error adding note:', error);
//     res.status(500).json({ message: 'Failed to add note.', error: error.message });
//   }
// });


const uploadLeadNote = asyncHandler(async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  
  try {
    const { leadId } = req.params;
    const { text } = req.body;

    // Validate request
    if (!text && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'No text or files provided.' });
    }

    // Find the lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    // Ensure notes array exists
    if (!Array.isArray(lead.notes)) {
      lead.notes = [];
    }

    // Create a new note object
    const note = {
      createdAt: new Date(),
    };

    // Add text if provided
    if (text) {
      note.text = text;
    }

    // Process files if uploaded
    if (req.files && req.files.length > 0) {
      note.files = req.files.map((file) => ({
        fileUrl: file.location, // File URL from S3
        fileName: file.originalname, // Original file name
        fileType: file.mimetype, // MIME type
        fileSize: file.size, // File size
      }));
    }

    // Push the note to the notes array
    lead.notes.push(note);

    // Save the updated lead
    await lead.save();

    // Return success response
    res.status(201).json({
      message: 'Note added successfully.',
      note,
      lead,
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Failed to add note.', error: error.message });
  }
});



module.exports = {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  getLeadById,
  uploadLeadNote
};
