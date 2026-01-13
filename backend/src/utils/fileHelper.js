/**
 * Transform attachment to include URL for base64 stored files
 * @param {Object} attachment - Attachment object from database
 * @param {String} ticketId - Ticket ID
 * @param {String} type - 'ticket' or 'comment'
 * @param {String} parentId - Ticket ID or Comment ID
 * @returns {Object} Transformed attachment with URL
 */
const transformAttachment = (attachment, type, parentId) => {
  if (!attachment) return null;

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  
  return {
    _id: attachment._id,
    filename: attachment.filename,
    mimetype: attachment.mimetype,
    size: attachment.size,
    uploadedAt: attachment.uploadedAt,
    // Generate URL for file endpoint - use relative URL so frontend can construct full URL
    url: `/api/files/${type}/${parentId}/${attachment._id}`,
    // For inline display (data URI)
    dataUri: attachment.data ? `data:${attachment.mimetype};base64,${attachment.data}` : null,
  };
};

/**
 * Transform ticket object to include file URLs
 * @param {Object} ticket - Ticket document
 * @returns {Object} Transformed ticket
 */
const transformTicket = (ticket) => {
  const ticketObj = ticket.toObject ? ticket.toObject() : ticket;
  
  if (ticketObj.attachments && ticketObj.attachments.length > 0) {
    ticketObj.attachments = ticketObj.attachments.map(att => {
      const transformed = transformAttachment(att, 'ticket', ticketObj._id);
      // Remove base64 data from response to reduce payload size
      delete transformed.dataUri;
      return transformed;
    });
  }
  
  return ticketObj;
};

/**
 * Transform comment object to include file URLs
 * @param {Object} comment - Comment document
 * @returns {Object} Transformed comment
 */
const transformComment = (comment) => {
  const commentObj = comment.toObject ? comment.toObject() : comment;
  
  if (commentObj.attachments && commentObj.attachments.length > 0) {
    commentObj.attachments = commentObj.attachments.map(att => {
      const transformed = transformAttachment(att, 'comment', commentObj._id);
      // Remove base64 data from response to reduce payload size
      delete transformed.dataUri;
      return transformed;
    });
  }
  
  return commentObj;
};

module.exports = {
  transformAttachment,
  transformTicket,
  transformComment,
};
