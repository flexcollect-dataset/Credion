const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CaseJudgment = sequelize.define('CaseJudgment', {
    caseJudgmentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'case_judgment_id'
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'case_id',
        references: {
            model: 'cases',
            key: 'case_id'
        }
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'uuid'
    },
    uniqueId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'unique_id'
    },
    number: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'number'
    },
    caseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'case_number'
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'title'
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date'
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'url'
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'state'
    },
    court: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court'
    },
    courtType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court_type'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'location'
    },
    officer: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'officer'
    },
    caseType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'case_type'
    },
    catchwords: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'catchwords'
    },
    legislation: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'legislation'
    },
    casesCited: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cases_cited'
    },
    result: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'result'
    },
    division: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'division'
    },
    registry: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'registry'
    },
    nationalPracticeArea: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'national_practice_area'
    },
    subArea: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'sub_area'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'category'
    },
    numberOfParagraphs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'number_of_paragraphs'
    },
    dateOfLastSubmission: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_of_last_submission'
    },
    orders: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'orders'
    },
    reasonsForJudgment: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'reasons_for_judgment'
    },
    priorDecisions: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'prior_decisions'
    }
}, {
    tableName: 'case_judgments',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['case_id']
        },
        {
            fields: ['uuid']
        }
    ]
});

module.exports = CaseJudgment;

