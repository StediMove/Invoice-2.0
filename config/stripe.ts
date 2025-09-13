// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RaBUjPkI13cOdhVpbwR5hJA8wpJf37id1J94wpHpPsXgWjLaEjjoKoxpaK4hNX0wm9so92TJFylZIrIkR0IxtJ200bB1oJC5k',
  
  // Product IDs
  products: {
    professional: {
      monthly: 'prod_T1QoiXQoDyBgW1',
      yearly: 'prod_T2F9KFcrVqZryY'
    }
  },
  
  // Payment Links
  paymentLinks: {
    professional: {
      monthly: 'https://buy.stripe.com/test_6oU3cx8PL48VcbS57uak001',
      yearly: 'https://buy.stripe.com/test_7sY9AV0jf0WJ6RygQcak002'
    }
  }
} as const;