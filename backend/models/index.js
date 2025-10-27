const { sequelize } = require('../config/db');
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const PasswordResetToken = require('./PasswordResetToken');
const UserPaymentMethod = require('./UserPaymentMethod');
const Report = require('./Report');
const Entity = require('./Entity');
const AsicExtract = require('./AsicExtract');
const Address = require('./Address');
const Director = require('./Director');
const Shareholder = require('./Shareholder');
const ShareStructure = require('./ShareStructure');
const Document = require('./Document');
const TaxDebt = require('./TaxDebt');
const Case = require('./Case');
const CaseParty = require('./CaseParty');
const CaseHearing = require('./CaseHearing');
const CaseDocument = require('./CaseDocument');
const CaseApplication = require('./CaseApplication');
const CaseJudgment = require('./CaseJudgment');
const Insolvency = require('./Insolvency');
const InsolvencyParty = require('./InsolvencyParty');
const Licence = require('./Licence');
const AsicDocument = require('./AsicDocument');
const Matter = require('./Matter');
const UserReport = require('./UserReport');

// Define associations
User.hasMany(UserPaymentMethod, { 
    foreignKey: 'user_id', 
    as: 'paymentMethods',
    onDelete: 'CASCADE'
});
UserPaymentMethod.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
});

// Matter associations
User.hasMany(Matter, { foreignKey: 'user_id', as: 'matters', onDelete: 'CASCADE' });
Matter.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// UserReport associations
User.hasMany(UserReport, { foreignKey: 'user_id', as: 'userReports', onDelete: 'CASCADE' });
UserReport.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Matter.hasMany(UserReport, { foreignKey: 'matter_id', as: 'userReports', onDelete: 'CASCADE' });
UserReport.belongsTo(Matter, { foreignKey: 'matter_id', as: 'matter' });

// Report associations - User only (no Matter link for now)
User.hasMany(Report, { foreignKey: 'user_id', as: 'reports', onDelete: 'CASCADE' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Report associations (removed user_id foreign key)

Report.hasOne(Entity, { foreignKey: 'report_id', as: 'entity', onDelete: 'CASCADE'});
Entity.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

Report.hasMany(AsicExtract, { foreignKey: 'report_id', as: 'asicExtracts', onDelete: 'CASCADE'});
AsicExtract.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

Report.hasOne(TaxDebt, { foreignKey: 'report_id', as: 'taxDebt', onDelete: 'CASCADE'});
TaxDebt.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

// AsicExtract associations
AsicExtract.hasMany(Address, { foreignKey: 'asic_extract_id', as: 'addresses', onDelete: 'CASCADE'});
Address.belongsTo(AsicExtract, { foreignKey: 'asic_extract_id', as: 'asicExtract' });

AsicExtract.hasMany(Director, { foreignKey: 'asic_extract_id', as: 'directors', onDelete: 'CASCADE'});
Director.belongsTo(AsicExtract, { foreignKey: 'asic_extract_id', as: 'asicExtract' });

AsicExtract.hasMany(Shareholder, { foreignKey: 'asic_extract_id', as: 'shareholders', onDelete: 'CASCADE'});
Shareholder.belongsTo(AsicExtract, { foreignKey: 'asic_extract_id', as: 'asicExtract' });

AsicExtract.hasMany(ShareStructure, { foreignKey: 'asic_extract_id', as: 'shareStructures', onDelete: 'CASCADE'});
ShareStructure.belongsTo(AsicExtract, { foreignKey: 'asic_extract_id', as: 'asicExtract' });

AsicExtract.hasMany(Document, { foreignKey: 'asic_extract_id', as: 'documents', onDelete: 'CASCADE'});
Document.belongsTo(AsicExtract, { foreignKey: 'asic_extract_id', as: 'asicExtract' });

// Case associations
Report.hasMany(Case, { foreignKey: 'report_id', as: 'cases', onDelete: 'CASCADE'});
Case.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

Case.hasMany(CaseParty, { foreignKey: 'case_id', as: 'parties', onDelete: 'CASCADE'});
CaseParty.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

Case.hasMany(CaseHearing, { foreignKey: 'case_id', as: 'hearings', onDelete: 'CASCADE'});
CaseHearing.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

Case.hasMany(CaseDocument, { foreignKey: 'case_id', as: 'documents', onDelete: 'CASCADE'});
CaseDocument.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

Case.hasMany(CaseApplication, { foreignKey: 'case_id', as: 'applications', onDelete: 'CASCADE'});
CaseApplication.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

Case.hasMany(CaseJudgment, { foreignKey: 'case_id', as: 'judgments', onDelete: 'CASCADE'});
CaseJudgment.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

// Insolvency associations
Report.hasMany(Insolvency, { foreignKey: 'report_id', as: 'insolvencies', onDelete: 'CASCADE'});
Insolvency.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

Insolvency.hasMany(InsolvencyParty, { foreignKey: 'insolvency_id', as: 'parties', onDelete: 'CASCADE'});
InsolvencyParty.belongsTo(Insolvency, { foreignKey: 'insolvency_id', as: 'insolvency' });

// Licence and AsicDocument associations
Report.hasMany(Licence, { foreignKey: 'report_id', as: 'licences', onDelete: 'CASCADE'});
Licence.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

Report.hasMany(AsicDocument, { foreignKey: 'report_id', as: 'asicDocuments', onDelete: 'CASCADE'});
AsicDocument.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

// Export all models
module.exports = {
    sequelize,
    User,
    RefreshToken,
    PasswordResetToken,
    UserPaymentMethod,
    Report,
    Entity,
    AsicExtract,
    Address,
    Director,
    Shareholder,
    ShareStructure,
    Document,
    TaxDebt,
    Case,
    CaseParty,
    CaseHearing,
    CaseDocument,
    CaseApplication,
    CaseJudgment,
    Insolvency,
    InsolvencyParty,
    Licence,
    AsicDocument,
    Matter,
    UserReport
};

