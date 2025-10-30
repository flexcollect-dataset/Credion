const { sequelize } = require('./config/db');
const { Report, UserReport } = require('./models');

(async () => {
	try {
		console.log('🔗 Connecting to database...');
		await sequelize.authenticate();
		console.log('✅ Connected');

		// Delete user_report first (FK depends on report)
		console.log('🗑️ Deleting user_reports id=62 ...');
		const urDel = await UserReport.destroy({ where: { id: 62 } });
		console.log(`   user_reports deleted: ${urDel}`);

		console.log('🗑️ Deleting reports id=60 ...');
		const rDel = await Report.destroy({ where: { id: 60 } });
		console.log(`   reports deleted: ${rDel}`);

		console.log('✅ Done');
	} catch (err) {
		console.error('❌ Error:', err.message);
		process.exitCode = 1;
	} finally {
		await sequelize.close();
	}
})();
