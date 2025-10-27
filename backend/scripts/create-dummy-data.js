const { sequelize, UserReport, Matter, User } = require('../models');

async function createDummyData() {
  try {
    console.log('Creating dummy data...');
    
    // Get a user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No user found. Please create a user first.');
      return;
    }

    console.log(`Found user: ${user.userId}`);

    // Create dummy matters if they don't exist
    let matters = await Matter.findAll({ where: { userId: user.userId } });
    
    if (matters.length === 0) {
      console.log('Creating dummy matters...');
      const dummyMatters = [
        { matterName: 'Corporate Investigation', description: 'Company records and director search' },
        { matterName: 'Due Diligence Review', description: 'Pre-acquisition verification' },
        { matterName: 'Litigation Support', description: 'Court document analysis' }
      ];

      for (const matterData of dummyMatters) {
        const matter = await Matter.create({
          userId: user.userId,
          matterName: matterData.matterName,
          description: matterData.description,
          status: 'active'
        });
        matters.push(matter);
        console.log(`✅ Created matter: ${matter.matterName}`);
      }
    } else {
      console.log(`Found ${matters.length} existing matters`);
    }

    // Check if userreports table exists
    try {
      await UserReport.findAll({ limit: 1 });
    } catch (error) {
      console.log('Creating userreports table...');
      await UserReport.sync();
    }

    // Check if we already have reports
    const existingReports = await UserReport.findAll({ where: { userId: user.userId } });
    if (existingReports.length > 0) {
      console.log(`✅ User reports already exist (${existingReports.length} reports)`);
      process.exit(0);
      return;
    }

    // Create dummy user reports
    console.log('Creating dummy user reports...');
    const dummyReports = [
      { reportName: 'ABN Search Report', isPaid: true },
      { reportName: 'ASIC Company Extract', isPaid: true },
      { reportName: 'Director Search Report', isPaid: false },
      { reportName: 'Property Search Report', isPaid: true },
      { reportName: 'Business Records Search', isPaid: false },
    ];

    for (let i = 0; i < dummyReports.length; i++) {
      const report = dummyReports[i];
      // Distribute reports across matters
      const matter = matters[i % matters.length];
      
      await UserReport.create({
        userId: user.userId,
        matterId: matter.matterId,
        reportName: report.reportName,
        isPaid: report.isPaid
      });
      
      console.log(`✅ Created report: ${report.reportName} for matter: ${matter.matterName}`);
    }

    console.log('✅ Dummy data created successfully');
    
    // Show summary
    const allReports = await UserReport.findAll({ where: { userId: user.userId } });
    console.log(`\n📊 Total user reports: ${allReports.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
    process.exit(1);
  }
}

createDummyData();
