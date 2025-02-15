const asyncHandler = require('express-async-handler');
const Lead = require('../models/leadModel')

/**
 * Get all leads for the logged-in user
 */
const getLeads = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
      const leads = await Lead.find({ ownerId: userId });
      res.status(200).json({ leads });
    } catch (error) {
      res.status(500).json({ message: "Error fetching leads for user", error });
    }
});

/**
 * Add a new lead
 */
const addLead = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, company, notes } = req.body;
  
    if (!firstName || !lastName || !email) {
      res.status(400);
      throw new Error("First Name, Last Name, and Email are required.");
    }
  
    try {
      const newLead = await Lead.create({
        firstName,
        lastName,
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
 * Get a lead by ID for the logged-in user
 */
const getLeadById = asyncHandler(async (req, res) => {
    const { userId, id } = req.params;

    try {
      const lead = await Lead.findOne({ _id: id, ownerId: userId });
  
      if (!lead) {
        res.status(404).json({ message: "Lead not found" });
        return;
      }
  
      res.status(200).json({ lead });
    } catch (error) {
      res.status(500).json({ message: "Error fetching lead", error });
    }
});

const updateLead = asyncHandler(async (req, res) => {
    // Find the lead by ID and ensure it belongs to the logged-in user
    const lead = await Lead.findOne({ _id: req.params.id, ownerId: req.user.id });
  
    if (!lead) {
      res.status(404);
      throw new Error('Lead not found or not authorized.');
    }
  
    // Update the lead with the provided fields
    Object.keys(req.body).forEach((key) => {
      lead[key] = req.body[key] || lead[key];
    });
  
    const updatedLead = await lead.save();
  
    res.status(200).json(updatedLead);
  });
  
  /**
   * Delete a lead
   */
  const deleteLead = asyncHandler(async (req, res) => {
    // Find the lead by ID and ensure it belongs to the logged-in user
    const lead = await Lead.findOne({ _id: req.params.id, ownerId: req.user.id });
  
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
