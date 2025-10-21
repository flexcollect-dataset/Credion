const {
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
    InsolvencyParty
} = require('../models');

/**
 * Parse and store complete report data
 * @param {number} reportId - The report ID
 * @param {Object} reportData - The raw report data from API
 */
async function parseAndStoreReportData(reportId, reportData) {
    try {
        console.log(`📝 Starting to parse and store report data for report ID: ${reportId}`);

        // 1. Store Entity data
        if (reportData.entity) {
            await storeEntity(reportId, reportData.entity);
        }

        // 2. Store Tax Debt data
        if (reportData.current_tax_debt) {
            await storeTaxDebt(reportId, reportData.current_tax_debt);
        }

        // 3. Store ASIC Extracts and related data
        if (reportData.asic_extracts && reportData.asic_extracts.length > 0) {
            for (const extract of reportData.asic_extracts) {
                await storeAsicExtract(reportId, extract);
            }
        }

        // 4. Store Cases data
        if (reportData.cases) {
            for (const caseUuid in reportData.cases) {
                const caseData = reportData.cases[caseUuid];
                await storeCase(reportId, caseData);
            }
        }

        // 5. Store Insolvencies data
        if (reportData.insolvencies) {
            for (const insolvencyUuid in reportData.insolvencies) {
                const insolvencyData = reportData.insolvencies[insolvencyUuid];
                await storeInsolvency(reportId, insolvencyData);
            }
        }

        console.log(`✅ Successfully parsed and stored all report data for report ID: ${reportId}`);
        return { success: true };

    } catch (error) {
        console.error(`❌ Error parsing and storing report data:`, error);
        throw error;
    }
}

/**
 * Store Entity data
 */
async function storeEntity(reportId, entityData) {
    try {
        await Entity.create({
            reportId: reportId,
            abn: entityData.abn || null,
            acn: entityData.acn || null,
            isArbn: entityData.is_arbn || false,
            abrGstRegistrationDate: entityData.abr_gst_registration_date || null,
            abrGstStatus: entityData.abr_gst_status || null,
            abrPostcode: entityData.abr_postcode || null,
            abrState: entityData.abr_state || null,
            abrStatus: entityData.abr_status || null,
            asicDateOfRegistration: entityData.asic_date_of_registration || null,
            asicStatus: entityData.asic_status || null,
            documentNumber: entityData.document_number || null,
            formerNames: entityData.former_names || [],
            name: entityData.name || null,
            reference: entityData.reference || null,
            irf: entityData.irf || null,
            reviewDate: entityData.review_date || null,
            nameStartAt: entityData.name_start_at || null,
            registeredIn: entityData.registered_in || null,
            organisationType: entityData.organisation_type || null,
            disclosingEntity: entityData.disclosing_entity || null,
            organisationClass: entityData.organisation_class || null,
            organisationSubClass: entityData.organisation_sub_class || null,
            entityCreatedAt: entityData.created_at || null
        });
        console.log(`   ✅ Entity stored`);
    } catch (error) {
        console.error(`   ❌ Error storing entity:`, error);
        throw error;
    }
}

/**
 * Store Tax Debt data
 */
async function storeTaxDebt(reportId, taxDebtData) {
    try {
        await TaxDebt.create({
            reportId: reportId,
            date: taxDebtData.date || null,
            amount: taxDebtData.amount || null,
            status: taxDebtData.status || null,
            atoAddedAt: taxDebtData.ato_added_at || null,
            atoUpdatedAt: taxDebtData.ato_updated_at || null
        });
        console.log(`   ✅ Tax Debt stored`);
    } catch (error) {
        console.error(`   ❌ Error storing tax debt:`, error);
        throw error;
    }
}

/**
 * Store ASIC Extract and all related data
 */
async function storeAsicExtract(reportId, extractData) {
    try {
        // Create ASIC Extract
        const asicExtract = await AsicExtract.create({
            reportId: reportId,
            externalId: extractData.id || null,
            type: extractData.type || null
        });

        const asicExtractId = asicExtract.asicExtractId;
        console.log(`   ✅ ASIC Extract stored (ID: ${asicExtractId})`);

        // Store Addresses
        if (extractData.addresses && extractData.addresses.length > 0) {
            for (const addr of extractData.addresses) {
                await Address.create({
                    asicExtractId: asicExtractId,
                    externalId: addr.id || null,
                    type: addr.type || null,
                    entity: addr.entity || null,
                    address: addr.address || null,
                    careOf: addr.care_of || null,
                    address1: addr.address_1 || null,
                    address2: addr.address_2 || null,
                    suburb: addr.suburb || null,
                    state: addr.state || null,
                    postcode: addr.postcode || null,
                    country: addr.country || null,
                    status: addr.status || null,
                    startDate: addr.start_date || null,
                    endDate: addr.end_date || null,
                    documentNumber: addr.document_number || null
                });
            }
            console.log(`      ✅ ${extractData.addresses.length} Addresses stored`);
        }

        // Store Contact Addresses
        if (extractData.contact_addresses && extractData.contact_addresses.length > 0) {
            for (const addr of extractData.contact_addresses) {
                await Address.create({
                    asicExtractId: asicExtractId,
                    externalId: addr.id || null,
                    type: addr.type || null,
                    entity: addr.entity || null,
                    address: addr.address || null,
                    careOf: addr.care_of || null,
                    address1: addr.address_1 || null,
                    address2: addr.address_2 || null,
                    suburb: addr.suburb || null,
                    state: addr.state || null,
                    postcode: addr.postcode || null,
                    country: addr.country || null,
                    status: addr.status || null,
                    startDate: addr.start_date || null,
                    endDate: addr.end_date || null,
                    documentNumber: addr.document_number || null
                });
            }
            console.log(`      ✅ ${extractData.contact_addresses.length} Contact Addresses stored`);
        }

        // Store Directors
        if (extractData.directors && extractData.directors.length > 0) {
            for (const director of extractData.directors) {
                await Director.create({
                    asicExtractId: asicExtractId,
                    type: director.type || null,
                    name: director.name || null,
                    dob: director.dob || null,
                    placeOfBirth: director.place_of_birth || null,
                    directorIdExternal: director.director_id || null,
                    documentNumber: director.document_number || null,
                    startDate: director.start_date || null,
                    endDate: director.end_date || null,
                    status: director.status || null,
                    addressData: director.address || null
                });
            }
            console.log(`      ✅ ${extractData.directors.length} Directors stored`);
        }

        // Store Secretaries
        if (extractData.secretaries && extractData.secretaries.length > 0) {
            for (const secretary of extractData.secretaries) {
                await Director.create({
                    asicExtractId: asicExtractId,
                    type: secretary.type || null,
                    name: secretary.name || null,
                    dob: secretary.dob || null,
                    placeOfBirth: secretary.place_of_birth || null,
                    directorIdExternal: secretary.director_id || null,
                    documentNumber: secretary.document_number || null,
                    startDate: secretary.start_date || null,
                    endDate: secretary.end_date || null,
                    status: secretary.status || null,
                    addressData: secretary.address || null
                });
            }
            console.log(`      ✅ ${extractData.secretaries.length} Secretaries stored`);
        }

        // Store Shareholders
        if (extractData.shareholders && extractData.shareholders.length > 0) {
            for (const shareholder of extractData.shareholders) {
                await Shareholder.create({
                    asicExtractId: asicExtractId,
                    name: shareholder.name || null,
                    acn: shareholder.acn || null,
                    class: shareholder.class || null,
                    numberHeld: shareholder.number_held || null,
                    percentageHeld: shareholder.percentage_held || null,
                    documentNumber: shareholder.document_number || null,
                    beneficiallyOwned: shareholder.beneficially_owned || null,
                    fullyPaid: shareholder.fully_paid || null,
                    jointlyHeld: shareholder.jointly_held || null,
                    status: shareholder.status || null,
                    addressData: shareholder.address || null
                });
            }
            console.log(`      ✅ ${extractData.shareholders.length} Shareholders stored`);
        }

        // Store Share Structures
        if (extractData.share_structures && extractData.share_structures.length > 0) {
            for (const shareStructure of extractData.share_structures) {
                await ShareStructure.create({
                    asicExtractId: asicExtractId,
                    classCode: shareStructure.class_code || null,
                    classDescription: shareStructure.class_description || null,
                    status: shareStructure.status || null,
                    shareCount: shareStructure.share_count || null,
                    amountPaid: shareStructure.amount_paid || null,
                    amountDue: shareStructure.amount_due || null,
                    documentNumber: shareStructure.document_number || null
                });
            }
            console.log(`      ✅ ${extractData.share_structures.length} Share Structures stored`);
        }

        // Store Documents
        if (extractData.documents && extractData.documents.length > 0) {
            for (const doc of extractData.documents) {
                await Document.create({
                    asicExtractId: asicExtractId,
                    type: doc.type || null,
                    description: doc.description || null,
                    documentNumber: doc.document_number || null,
                    formCode: doc.form_code || null,
                    pageCount: doc.page_count || null,
                    effectiveAt: doc.effective_at || null,
                    processedAt: doc.processed_at || null,
                    receivedAt: doc.received_at || null
                });
            }
            console.log(`      ✅ ${extractData.documents.length} Documents stored`);
        }

    } catch (error) {
        console.error(`   ❌ Error storing ASIC extract:`, error);
        throw error;
    }
}

/**
 * Store Case and all related data
 */
async function storeCase(reportId, caseData) {
    try {
        // Create Case
        const caseRecord = await Case.create({
            reportId: reportId,
            uuid: caseData.uuid || null,
            type: caseData.type || null,
            notificationTime: caseData.notification_time || null,
            courtName: caseData.court_name || null,
            state: caseData.state || null,
            courtType: caseData.court_type || null,
            caseType: caseData.case_type || null,
            caseNumber: caseData.case_number || null,
            jurisdiction: caseData.jurisdiction || null,
            suburb: caseData.suburb || null,
            nextHearingDate: caseData.next_hearing_date || null,
            caseName: caseData.case_name || null,
            url: caseData.url || null,
            totalParties: caseData.total_parties || null,
            totalDocuments: caseData.total_documents || null,
            totalHearings: caseData.total_hearings || null,
            timezone: caseData.timezone || null,
            internalReference: caseData.internal_reference || null,
            name: caseData.name || null,
            otherNames: caseData.other_names || null,
            insolvencyRiskFactor: caseData.insolvency_risk_factor || null,
            partyRole: caseData.party_role || null,
            mostRecentEvent: caseData.most_recent_event || null,
            matchOn: caseData.match_on || null
        });

        const caseId = caseRecord.caseId;
        console.log(`   ✅ Case stored (UUID: ${caseData.uuid})`);

        // Store Case Parties
        if (caseData.parties && caseData.parties.length > 0) {
            for (const party of caseData.parties) {
                await CaseParty.create({
                    caseId: caseId,
                    name: party.name || null,
                    type: party.type || null,
                    role: party.role || null,
                    offence: party.offence || null,
                    plea: party.plea || null,
                    representativeFirm: party.representative_firm || null,
                    representativeName: party.representative_name || null,
                    address: party.address || null,
                    phone: party.phone || null,
                    fax: party.fax || null,
                    abn: party.abn || null,
                    acn: party.acn || null
                });
            }
            console.log(`      ✅ ${caseData.parties.length} Case Parties stored`);
        }

        // Store Case Hearings
        if (caseData.hearings && caseData.hearings.length > 0) {
            for (const hearing of caseData.hearings) {
                await CaseHearing.create({
                    caseId: caseId,
                    datetime: hearing.datetime || null,
                    officer: hearing.officer || null,
                    courtRoom: hearing.court_room || null,
                    courtName: hearing.court_name || null,
                    courtPhone: hearing.court_phone || null,
                    courtAddress: hearing.court_address || null,
                    courtSuburb: hearing.court_suburb || null,
                    type: hearing.type || null,
                    listNo: hearing.list_no || null,
                    outcome: hearing.outcome || null
                });
            }
            console.log(`      ✅ ${caseData.hearings.length} Case Hearings stored`);
        }

        // Store Case Documents
        if (caseData.documents && caseData.documents.length > 0) {
            for (const doc of caseData.documents) {
                await CaseDocument.create({
                    caseId: caseId,
                    datetime: doc.datetime || null,
                    title: doc.title || null,
                    description: doc.description || null,
                    filedBy: doc.filed_by || null
                });
            }
            console.log(`      ✅ ${caseData.documents.length} Case Documents stored`);
        }

        // Store Case Applications
        if (caseData.applications && caseData.applications.length > 0) {
            for (const application of caseData.applications) {
                await CaseApplication.create({
                    caseId: caseId,
                    title: application.title || null,
                    type: application.type || null,
                    status: application.status || null,
                    dateFiled: application.date_filed || null,
                    dateFinalised: application.date_finalised || null
                });
            }
            console.log(`      ✅ ${caseData.applications.length} Case Applications stored`);
        }

        // Store Case Judgments
        if (caseData.judgments && caseData.judgments.length > 0) {
            for (const judgment of caseData.judgments) {
                await CaseJudgment.create({
                    caseId: caseId,
                    uuid: judgment.uuid || null,
                    uniqueId: judgment.unique_id || null,
                    number: judgment.number || null,
                    caseNumber: judgment.case_number || null,
                    title: judgment.title || null,
                    date: judgment.date || null,
                    url: judgment.url || null,
                    state: judgment.state || null,
                    court: judgment.court || null,
                    courtType: judgment.court_type || null,
                    location: judgment.location || null,
                    officer: judgment.officer || null,
                    caseType: judgment.case_type || null,
                    catchwords: judgment.catchwords || null,
                    legislation: judgment.legislation || null,
                    casesCited: judgment.cases_cited || null,
                    result: judgment.result || null,
                    division: judgment.division || null,
                    registry: judgment.registry || null,
                    nationalPracticeArea: judgment.national_practice_area || null,
                    subArea: judgment.sub_area || null,
                    category: judgment.category || null,
                    numberOfParagraphs: judgment.number_of_paragraphs || null,
                    dateOfLastSubmission: judgment.date_of_last_submission || null,
                    orders: judgment.orders || null,
                    reasonsForJudgment: judgment.reasons_for_judgment || null,
                    priorDecisions: judgment.prior_decisions || []
                });
            }
            console.log(`      ✅ ${caseData.judgments.length} Case Judgments stored`);
        }

    } catch (error) {
        console.error(`   ❌ Error storing case:`, error);
        throw error;
    }
}

/**
 * Store Insolvency and all related data
 */
async function storeInsolvency(reportId, insolvencyData) {
    try {
        // Create Insolvency
        const insolvency = await Insolvency.create({
            reportId: reportId,
            uuid: insolvencyData.uuid || null,
            type: insolvencyData.type || null,
            notificationTime: insolvencyData.notification_time || null,
            courtName: insolvencyData.court_name || null,
            caseType: insolvencyData.case_type || null,
            caseNumber: insolvencyData.case_number || null,
            asicNoticeId: insolvencyData.asic_notice_id || null,
            caseName: insolvencyData.case_name || null,
            totalParties: insolvencyData.total_parties || null,
            internalReference: insolvencyData.internal_reference || null,
            name: insolvencyData.name || null,
            otherNames: insolvencyData.other_names || null,
            insolvencyRiskFactor: insolvencyData.insolvency_risk_factor || null,
            matchOn: insolvencyData.match_on || null
        });

        const insolvencyId = insolvency.insolvencyId;
        console.log(`   ✅ Insolvency stored (UUID: ${insolvencyData.uuid})`);

        // Store Insolvency Parties
        if (insolvencyData.parties && insolvencyData.parties.length > 0) {
            for (const party of insolvencyData.parties) {
                await InsolvencyParty.create({
                    insolvencyId: insolvencyId,
                    name: party.name || null,
                    acn: party.acn || null,
                    url: party.url || null
                });
            }
            console.log(`      ✅ ${insolvencyData.parties.length} Insolvency Parties stored`);
        }

    } catch (error) {
        console.error(`   ❌ Error storing insolvency:`, error);
        throw error;
    }
}

module.exports = {
    parseAndStoreReportData
};
