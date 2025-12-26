// NO 'use server' - this is just a barrel file

// Re-export all actions from modular files
export { 
  createOrder, 
  updateOrder, 
  deleteOrder, 
  getOrderById 
} from './orders-actions';

export { 
  createCapitalEntry, 
  updateCapitalEntry, 
  deleteCapitalEntry, 
  getCapitalSummary 
} from './capital-actions';

export { 
  updateUser, 
  deleteUser, 
  getUserById, 
  getAllUsers 
} from './users-actions';

export { seedDatabase } from './seed-actions';