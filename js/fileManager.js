/**
 * CodeLens AI - File Manager
 * Handles drag-and-drop code uploads, File API reading, and extension extraction.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FileManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class FileManager {
    constructor(dropZoneEl, fileInputEl, onFileLoaded) {
      this.dropZone = dropZoneEl;
      this.fileInput = fileInputEl;
      this.onFileLoaded = onFileLoaded;
      this.init();
    }

    init() {
      if (this.dropZone) {
        ['dragenter', 'dragover'].forEach((eventName) => {
          this.dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('drag-active');
          });
        });

        ['dragleave', 'drop'].forEach((eventName) => {
          this.dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('drag-active');
          });
        });

        this.dropZone.addEventListener('drop', (e) => {
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            this.readFile(files[0]);
          }
        });
      }

      if (this.fileInput) {
        this.fileInput.addEventListener('change', (e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            this.readFile(files[0]);
          }
        });
      }
    }

    readFile(file) {
      if (!file) return;

      // Check max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit. Please upload a smaller code file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        if (typeof this.onFileLoaded === 'function') {
          this.onFileLoaded({
            name: file.name,
            size: file.size,
            type: file.type,
            content: content
          });
        }
      };

      reader.onerror = () => {
        alert('Error reading source code file.');
      };

      reader.readAsText(file);
    }
  }

  return { FileManager };
});
