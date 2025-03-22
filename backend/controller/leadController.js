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
  await lead.remove();
  res.status(200).json({ message: 'Lead deleted successfully.' });
});

module.exports = {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  getLeadById,
};
