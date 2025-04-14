export class MockDB {
  constructor(initialData = [], options = {}) {
    this.data = [...initialData];
    this.idField = options.idField || 'id';
    this.generateId = options.generateId || (() => Date.now().toString());
    this.createdAtField = options.createdAtField || 'created_at';
    this.updatedAtField = options.updatedAtField || 'updated_at';
  }

  findMany({ page = 1, perPage = 25, filters = {}, sort } = {}) {
    let filteredData = this.applyFilters(filters);
    
    if (sort) {
      filteredData = this.applySort(filteredData, sort);
    }

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      meta: {
        page,
        perPage,
        totalPages: Math.ceil(filteredData.length / perPage),
        totalItems: filteredData.length,
        filters,
        sort,
      },
    };
  }

  applyFilters(filters) {
    return Object.entries(filters).reduce((data, [key, value]) => {
      const [field, operation] = key.split(':');
      switch(operation) {
        case 'contains':
          return data.filter(item => 
            String(item[field]).toLowerCase().includes(String(value).toLowerCase())
          );
        case 'eq':
          return data.filter(item => item[field] === value);
        case 'in':
          return data.filter(item => value.includes(item[field]))
        default:
          return data;
      }
    }, this.data);
  }

  applySort(data, sort) {
    const [field, direction] = sort.split(',');
    const modifier = direction === 'desc' ? -1 : 1;
    return [...data].sort((a, b) => {
      if (a[field] < b[field]) return -1 * modifier;
      if (a[field] > b[field]) return 1 * modifier;
      return 0;
    });
  }

  findOne(id) {
    return this.data.find(item => item[this.idField] === id);
  }

  create(itemData) {
    const id = itemData[this.idField] || this.generateId();
    if (this.data.some(item => item[this.idField] === id)) {
      throw new Error(`Item with ${this.idField} ${id} already exists`);
    }
    const newItem = {
      ...itemData,
      [this.idField]: id,
      [this.createdAtField]: new Date().toISOString(),
      [this.updatedAtField]: new Date().toISOString(),
    };
    this.data.push(newItem);
    return newItem;
  }

  update(id, updates) {
    const index = this.data.findIndex(item => item[this.idField] === id);
    if (index === -1) throw new Error('Item not found');
    const updatedItem = {
      ...this.data[index],
      ...updates,
      [this.updatedAtField]: new Date().toISOString(),
    };
    this.data[index] = updatedItem;
    return updatedItem;
  }

  delete(id) {
    const index = this.data.findIndex(item => item[this.idField] === id);
    if (index === -1) throw new Error('Item not found');
    this.data.splice(index, 1);
    return true;
  }
}

export const simulateNetworkDelay = (response, delay = 500) => {
  return new Promise(resolve => setTimeout(() => resolve(response), delay));
}