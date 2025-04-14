import { MockDB, simulateNetworkDelay } from './mockDB'
import createApiThunk from '@app/apis/createApiThunk'
import customWorkMockData from '@tests/apis/mock_data/customWork'

// Create MockDB for custom works
const customWorkDB = new MockDB(customWorkMockData, {
  idField: 'id',
  generateId: () => `cw-${Date.now()}`,
})

// Common response handler
const handleResponse = (result, wrapperKey, meta) => {
  if (meta) {
    return {
      data: {
        [wrapperKey]: result,
        meta
      }
    }
  }
  return {
    data: { [wrapperKey]: result }
  }
}

// Fetch multiple custom works
const fetchCustomWorksMock = async ({ siteId, params = {} }) => {
  // Filter by site_id
  params.filters = params.filters || {}
  params.filters['site_id:eq'] = siteId
  
  const result = customWorkDB.findMany({
    page: params.page,
    perPage: params.perPage,
    filters: params.filters,
    sort: params.sort,
  })
  
  return simulateNetworkDelay(handleResponse(result.data, 'custom_works', result.meta))
}

// Fetch a single custom work
const fetchCustomWorkMock = async ({ siteId, id }) => {
  const result = customWorkDB.findOne(id)
  if (!result) throw new Error('Custom work not found')
  if (result.site_id !== siteId) throw new Error('Custom work does not belong to this site')
  
  return simulateNetworkDelay(handleResponse(result, 'custom_work'))
}

// Create one or multiple custom works
const createCustomWorksMock = async ({ siteId, customWorksData }) => {
  const createdWorks = customWorksData.map(workData => {
    return customWorkDB.create({ ...workData, site_id: siteId })
  })
  
  return simulateNetworkDelay(handleResponse(createdWorks, 'custom_works'))
}

// Update a custom work
const updateCustomWorkMock = async ({ siteId, id, customWorkData }) => {
  const existingWork = customWorkDB.findOne(id)
  if (!existingWork) throw new Error('Custom work not found')
  if (existingWork.site_id !== siteId) throw new Error('Custom work does not belong to this site')
  
  const result = customWorkDB.update(id, customWorkData)
  return simulateNetworkDelay(handleResponse(result, 'custom_work'))
}

// Delete a custom work
const deleteCustomWorkMock = async ({ siteId, id }) => {
  const existingWork = customWorkDB.findOne(id)
  if (!existingWork) throw new Error('Custom work not found')
  if (existingWork.site_id !== siteId) throw new Error('Custom work does not belong to this site')
  
  customWorkDB.delete(id)
  return simulateNetworkDelay({ data: null, status: 204 })
}

// Validate custom works data
const validateCustomWorksMock = async ({ siteId, customWorksData }) => {
  // Simple validation logic - in a real app this would be more complex
  const errors = []
  
  customWorksData.forEach((work, index) => {
    if (!work.title) {
      errors.push({ index, field: 'title', message: 'Title is required' })
    }
    if (!work.description) {
      errors.push({ index, field: 'description', message: 'Description is required' })
    }
    if (!work.performed_on) {
      errors.push({ index, field: 'performed_on', message: 'Performed on date is required' })
    }
  })
  
  return simulateNetworkDelay({
    data: {
      valid: errors.length === 0,
      errors
    }
  })
}

// Export thunks
export const fetchCustomWorksApi = createApiThunk(
  'customWork',
  'fetchCustomWorks',
  fetchCustomWorksMock
)

export const fetchCustomWorkApi = createApiThunk(
  'customWork',
  'fetchCustomWork',
  fetchCustomWorkMock
)

export const createCustomWorksApi = createApiThunk(
  'customWork',
  'createCustomWorks',
  createCustomWorksMock
)

export const updateCustomWorkApi = createApiThunk(
  'customWork',
  'updateCustomWork',
  updateCustomWorkMock
)

export const deleteCustomWorkApi = createApiThunk(
  'customWork',
  'deleteCustomWork',
  deleteCustomWorkMock
)

export const validateCustomWorksApi = createApiThunk(
  'customWork',
  'validateCustomWorks',
  validateCustomWorksMock
)
