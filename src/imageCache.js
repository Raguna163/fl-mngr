class ImageCache {
    constructor() {
        this.entries = []
        this.data = {}
    }
    addEntry(entry, data) {
        this.entries.push(entry);
        this.data[entry] = data;
    }
    showCache() {
        let size = 0;
        this.entries.forEach(entry => {
            size += this.data[entry].length * 8;
        });
        return size;
    }
    allEntries() {
        return this.entries;
    }
    getEntry(entry) {
        return this.data[entry];
    }
}

export default new ImageCache();