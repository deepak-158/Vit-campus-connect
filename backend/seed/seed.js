const bcrypt = require('bcryptjs');
const { sequelize, User, Request, Product, Message, Rating, Notification, syncDatabase } = require('../models');

// Sample data for seeding
const seedData = async () => {
  try {
    // Sync database
    await syncDatabase();

    console.log('Seeding database...');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Hosteller User',
        email: 'hosteller@vitbhopal.ac.in',
        password: hashedPassword,
        role: 'hosteller',
        isVerified: true,
        phoneNumber: '9876543210',
        hostelBlock: 'Block A',
        roomNumber: '101',
        points: 20,
        averageRating: 4.5
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Day Scholar User',
        email: 'dayscholar@vitbhopal.ac.in',
        password: hashedPassword,
        role: 'dayscholar',
        isVerified: true,
        phoneNumber: '9876543211',
        points: 30,
        averageRating: 4.8
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Another Hosteller',
        email: 'hosteller2@vitbhopal.ac.in',
        password: hashedPassword,
        role: 'hosteller',
        isVerified: true,
        phoneNumber: '9876543212',
        hostelBlock: 'Block B',
        roomNumber: '202',
        points: 15,
        averageRating: 4.2
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Another Day Scholar',
        email: 'dayscholar2@vitbhopal.ac.in',
        password: hashedPassword,
        role: 'dayscholar',
        isVerified: true,
        phoneNumber: '9876543213',
        points: 25,
        averageRating: 4.6
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Admin User',
        email: 'admin@vitbhopal.ac.in',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        phoneNumber: '9876543214',
        points: 100,
        averageRating: 5.0
      }
    ];

    for (const userData of users) {
      await User.create(userData);
    }

    console.log('Users seeded');

    // Create requests
    const requests = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        requesterId: '11111111-1111-1111-1111-111111111111', // Hosteller
        itemName: 'Groceries',
        description: 'Need some basic groceries: bread, milk, eggs, and fruits',
        quantity: 1,
        expectedPrice: 500,
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        status: 'pending',
        deliveryLocation: 'Block A, Room 101',
        isUrgent: true,
        category: 'groceries'
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        requesterId: '11111111-1111-1111-1111-111111111111', // Hosteller
        delivererId: '22222222-2222-2222-2222-222222222222', // Day Scholar
        itemName: 'Medicines',
        description: 'Need some cold medicines and painkillers',
        quantity: 1,
        expectedPrice: 200,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: 'accepted',
        deliveryLocation: 'Block A, Room 101',
        isUrgent: true,
        category: 'medicines'
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        requesterId: '33333333-3333-3333-3333-333333333333', // Another Hosteller
        itemName: 'Stationery',
        description: 'Need some notebooks, pens, and highlighters',
        quantity: 1,
        expectedPrice: 300,
        deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        status: 'pending',
        deliveryLocation: 'Block B, Room 202',
        isUrgent: false,
        category: 'stationery'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        requesterId: '33333333-3333-3333-3333-333333333333', // Another Hosteller
        delivererId: '44444444-4444-4444-4444-444444444444', // Another Day Scholar
        itemName: 'Food',
        description: 'Need some food from outside campus',
        quantity: 2,
        expectedPrice: 400,
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        status: 'delivered',
        deliveryLocation: 'Block B, Room 202',
        deliveryTime: new Date(),
        isUrgent: true,
        category: 'food',
        isCompleted: true
      }
    ];

    for (const requestData of requests) {
      await Request.create(requestData);
    }

    console.log('Requests seeded');

    // Create products
    const products = [
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        sellerId: '11111111-1111-1111-1111-111111111111', // Hosteller
        name: 'Data Structures Textbook',
        description: 'Slightly used textbook for Data Structures course',
        price: 350,
        quantity: 1,
        category: 'books',
        condition: 'good',
        status: 'available',
        images: JSON.stringify(['/uploads/products/sample-book.jpg']),
        isNegotiable: true,
        postedAt: new Date()
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        sellerId: '11111111-1111-1111-1111-111111111111', // Hosteller
        name: 'Scientific Calculator',
        description: 'Casio FX-991ES Plus scientific calculator',
        price: 800,
        quantity: 1,
        category: 'electronics',
        condition: 'like new',
        status: 'available',
        images: JSON.stringify(['/uploads/products/sample-calculator.jpg']),
        isNegotiable: false,
        postedAt: new Date()
      },
      {
        id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
        sellerId: '33333333-3333-3333-3333-333333333333', // Another Hosteller
        name: 'Study Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 600,
        quantity: 1,
        category: 'electronics',
        condition: 'good',
        status: 'available',
        images: JSON.stringify(['/uploads/products/sample-lamp.jpg']),
        isNegotiable: true,
        postedAt: new Date()
      },
      {
        id: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        sellerId: '33333333-3333-3333-3333-333333333333', // Another Hosteller
        name: 'DBMS Notes',
        description: 'Handwritten notes for Database Management Systems course',
        price: 200,
        quantity: 1,
        category: 'books',
        condition: 'good',
        status: 'sold',
        images: JSON.stringify(['/uploads/products/sample-notes.jpg']),
        isNegotiable: false,
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];

    for (const productData of products) {
      await Product.create(productData);
    }

    console.log('Products seeded');

    // Create messages
    const messages = [
      {
        id: 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
        senderId: '11111111-1111-1111-1111-111111111111', // Hosteller
        receiverId: '22222222-2222-2222-2222-222222222222', // Day Scholar
        content: 'Hi, any update on my medicine delivery?',
        requestId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        isRead: true,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
        senderId: '22222222-2222-2222-2222-222222222222', // Day Scholar
        receiverId: '11111111-1111-1111-1111-111111111111', // Hosteller
        content: 'Yes, I will deliver it within an hour.',
        requestId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        isRead: true,
        sentAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 hours ago
      },
      {
        id: 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
        senderId: '33333333-3333-3333-3333-333333333333', // Another Hosteller
        receiverId: '11111111-1111-1111-1111-111111111111', // Hosteller
        content: 'Is the calculator still available?',
        productId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        isRead: false,
        sentAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ];

    for (const messageData of messages) {
      await Message.create(messageData);
    }

    console.log('Messages seeded');

    // Create ratings
    const ratings = [
      {
        id: 'llllllll-llll-llll-llll-llllllllllll',
        raterId: '11111111-1111-1111-1111-111111111111', // Hosteller
        ratedUserId: '44444444-4444-4444-4444-444444444444', // Another Day Scholar
        requestId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        rating: 5,
        comment: 'Delivered quickly and was very friendly!',
        transactionType: 'request',
        createdAt: new Date()
      },
      {
        id: 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
        raterId: '44444444-4444-4444-4444-444444444444', // Another Day Scholar
        ratedUserId: '11111111-1111-1111-1111-111111111111', // Hosteller
        requestId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        rating: 4,
        comment: 'Clear instructions and good communication.',
        transactionType: 'request',
        createdAt: new Date()
      }
    ];

    for (const ratingData of ratings) {
      await Rating.create(ratingData);
    }

    console.log('Ratings seeded');

    // Create notifications
    const notifications = [
      {
        id: 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn',
        userId: '11111111-1111-1111-1111-111111111111', // Hosteller
        title: 'Request Accepted',
        message: 'Your request for Medicines has been accepted by a day scholar.',
        type: 'request',
        relatedId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'oooooooo-oooo-oooo-oooo-oooooooooooo',
        userId: '22222222-2222-2222-2222-222222222222', // Day Scholar
        title: 'New Message',
        message: 'You have a new message from Hosteller User.',
        type: 'message',
        relatedId: 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'pppppppp-pppp-pppp-pppp-pppppppppppp',
        userId: '11111111-1111-1111-1111-111111111111', // Hosteller
        title: 'New Message',
        message: 'You have a new message from Another Hosteller.',
        type: 'product',
        relatedId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ];

    for (const notificationData of notifications) {
      await Notification.create(notificationData);
    }

    console.log('Notifications seeded');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the seed function
seedData();
