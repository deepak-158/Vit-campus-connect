// Cancel delivery (day scholars only)
exports.cancelDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.delivererId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the deliverer of this request' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'This delivery cannot be cancelled' });
    }

    // Update request - remove deliverer and set back to pending
    request.delivererId = null;
    request.status = 'pending';
    await request.save();

    // Create notification for requester
    await Notification.create({
      userId: request.requesterId,
      title: 'Delivery Cancelled',
      message: `The delivery for your request "${request.itemName}" has been cancelled by the day scholar.`,
      type: 'request',
      relatedId: request.id
    });

    res.status(200).json({ 
      message: 'Delivery cancelled successfully', 
      request 
    });
  } catch (error) {
    console.error('Cancel delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
