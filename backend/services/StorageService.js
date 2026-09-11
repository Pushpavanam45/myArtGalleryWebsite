class StorageService {
  /**
   * Initialize any required storage resources
   */
  async init() {
    throw new Error('Method not implemented.');
  }

  /**
   * Save a file and return its public URL
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} - Public URL of the uploaded file
   */
  async save(file) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete a file given its URL
   * @param {string} url - Public URL of the uploaded file
   * @returns {Promise<void>}
   */
  async delete(url) {
    throw new Error('Method not implemented.');
  }
}

module.exports = StorageService;
