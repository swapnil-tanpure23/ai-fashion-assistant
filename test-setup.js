const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8000';

async function testBackend() {
  console.log('🧪 Testing Backend Setup...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test create user
    console.log('\n2. Testing user creation...');
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Test St',
      city: 'Test City',
      zipCode: '12345'
    };

    const userResponse = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    const userResult = await userResponse.json();
    console.log('✅ User creation:', userResult);

    // Test create order
    console.log('\n3. Testing order creation...');
    const orderData = {
      userInfo: userData,
      items: [
        {
          id: 'item1',
          name: 'Test Fashion Item',
          price: 29.99,
          quantity: 1,
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          prompt: 'Test fashion prompt'
        }
      ],
      total: 29.99,
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    const orderResult = await orderResponse.json();
    console.log('✅ Order creation:', orderResult);

    // Test get user orders
    console.log('\n4. Testing get user orders...');
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(userData.email)}`);
    const ordersResult = await ordersResponse.json();
    console.log('✅ User orders:', ordersResult);

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Docker is running');
    console.log('2. MongoDB container is started: docker-compose up -d');
    console.log('3. Backend is running: cd backend && npm start');
  }
}

// Run the test
testBackend(); 