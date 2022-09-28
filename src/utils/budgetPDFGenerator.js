import moment from "moment";

function getCompaniesFromActivities(query, pdf = false) {
    let companies = '';

    if (query.activities.length > 1) {
        query.activities.forEach((activity, index, activities) => {
            let companyName = pdf ? truncateCompanyName(activity.company) : activity.company;
            if(!companies.includes(companyName)) {
                companies += companyName;

                if(index !== (activities.length -1)) {
                    companies += ', ';
                }
            }
        });
    }
    else {
        companies = query.activities[0].company;
    }

    return companies;
}

function truncateCompanyName(name) {
    let result = '';

    switch (name) {
        case 'ВАН Холдинг': {
            result = 'В.Х.';
            break;
        }
        case 'Европа-ВН': {
            result = 'Е ВН';
            break;
        }
        case 'Винтерко-БГ': {
            result = 'В-БГ';
            break;
        }
        case 'ЕвроХарт': {
            result = 'Е.Х.';
            break;
        }
    }

    return result;
}

function truncateContragentName(name) {
    let parts = name.split(' ');
    if (parts[parts.length - 1] === 'ЕООД' || parts[parts.length - 1] === 'ООД' || parts[parts.length - 1] === 'АД' || parts[parts.length - 1] === 'ЕАД') {
        return parts.splice(0, parts.length - 1).join(' ');
    }
    else {
        return name;
    }
}

function generateQueryRows(queries) {
    let segment = {
        table: {
            widths: [ 240, 100, 60, 70, 105, 34, 30],
            body: []
        }
    }

    queries.forEach((query) => {
        let row = [];
        row.push({ text: query.title, style: 'row' });
        row.push({ text: query.reason, style: 'row' });
        let places = 'ФФ';
        if (query.places) {
            let result = query.places.toString();

            if (result.length < 20)
                places = result
        }

        row.push({ text: places, style: 'row' });
        row.push({ text: getCompaniesFromActivities(query, true), style: 'row' });
        row.push({ text: truncateContragentName(query.contractor), style: 'row' });
        let payDate = moment(query.payDate);
        row.push({ text: new Intl.NumberFormat('bg-BG',{style: 'decimal'}).format(query.totalSum), style: 'sumCell' });
        row.push({ text: payDate.format('D.M'), style: 'row' });
        segment.table.body.push(row);
    });

    return segment;
}

function generateSubTotal(queries) {
    let price = 0;

    queries.forEach((query) => {
        price += Number(query.totalSum);
    });

    return {
        table: {
            widths: [611, 73],
            body: [
                [
                    { text: 'Общо', style: 'rowRightBold' },
                    { text: price + ' лв.', style: 'rowRightBold', margin: [ 0, 0, 26, 0] }
                ]
            ]
        }
    }
}

export function generateDefinition(budget, params) {
    let definition = {
        content: [{
            columns: []
        }],
        styles: {
            title: {
                fontSize: 8,
                bold: true,
                alignment: 'center'
            },
            titleLeft: {
                fontSize: 8,
                bold: true,
                alignment: 'left'
            },
            row: {
                fontSize: 8
            },
            rowRightBold: {
                fontSize: 8,
                alignment: 'right',
                bold: true
            },
            rowBold: {
                fontSize: 8,
                bold: true
            },
            name: {
                fontSize: 8,
                italics: true
            },
            sumCell: {
                fontSize: 8,
                alignment: 'right'
            }
        },
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [ 15, 15, 15, 15 ]
    }

    let headerColumns = {
        stack: [{
            table: {
                widths: [611, 29, 35],
                body: [
                    [ { text: 'Договорни, фактурирани и очаквани плащания от дирекция "ЕП"', style: 'title' },
                        { text: new Date().getFullYear(), style: 'title' },
                        { text: 'плащане', style: 'title' }
                    ]
                ]
            }
        }]
    }

    let subheaderColumns = {
        table: {
            widths: [ 240, 100, 60, 70, 105, 34, 30],
            body: [
                [ { text: 'Основание', style: 'title' },
                    { text: '№ по ред плащане - чл., ал. от договора', style: 'title' },
                    { text: 'обект', style: 'title' },
                    { text: 'фирма ФФ', style: 'title' },
                    { text: 'контрагент', style: 'title' },
                    { text: 'сума', style: 'title' },
                    { text: 'дата', style: 'title' }
                ]
            ]
        }
    }

    headerColumns.stack.push(subheaderColumns);

    let autoQueries = budget.queries.filter((query) => { return query.type.includes('Transport')});

    if (autoQueries.length) {
        let autoSubheader = {
            table: {
                widths: [690],
                body: [
                    [
                        { text: 'АВТОПАРК', style: 'titleLeft'}
                    ]
                ]
            }
        }
        headerColumns.stack.push(autoSubheader);
        headerColumns.stack.push(generateQueryRows(autoQueries));
        headerColumns.stack.push(generateSubTotal(autoQueries));
    }

    let supportQueries = budget.queries.filter((query) => { return !query.type.includes('Transport')});

    if (supportQueries.length) {
        let supportSubheader = {
            table: {
                widths: [693],
                body: [
                    [
                        { text: 'ПОДДРЪЖКА', style: 'titleLeft'}
                    ]
                ]
            }
        }
        headerColumns.stack.push(supportSubheader);
        headerColumns.stack.push(generateQueryRows(supportQueries));
        headerColumns.stack.push(generateSubTotal(supportQueries));
    }

    let signatureColumns = {
        stack: [
            { text: '......................................................', style: 'row', margin: [5, 35, 0, 0] },
            { text: 'Одобрил: В. Николов', style: 'row', margin: [5, 0, 0, 0] },
            { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
            { text: 'Съгласувал: Вл. Николов', style: 'name', margin: [5, 0, 0, 0] },
            { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
            { text: 'Съгласувал: В. Божева', style: 'name', margin: [5, 0, 0, 0] },
            { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
            { text: 'Съгласувал: Ян. Стойчев', style: 'name', margin: [5, 0, 0, 0] },
            { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
            { text: 'Съгласувал: Л. Маргаритова', style: 'name', margin: [5, 0, 0, 0] },
            { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
            { text: 'Изготвил: М. Мъндев', style: 'name', margin: [5, 0, 0, 0] }
        ]
    }

    let dateCreated;

    if (params.isUrgent) {
        dateCreated = moment();
        dateCreated.set('year', parseInt(params.year, 10));
        dateCreated.isoWeek(parseInt(params.week, 10));
        dateCreated.isoWeekday(4);
    }
    else {
        dateCreated = moment(params.payDate, 'YYYY-MM-DD');
    }

    let total = 0;

    budget.queries.forEach((query) => {
        total += Number(query.totalSum);
    });

    let footer = {
        columns: [{ text: dateCreated.format('D.MM.GGGG'), style: 'row', margin: [10, 10, 0, 0] }]
    }

    if (params.isUrgent) {
        footer.columns.push({ text: 'Извънреден седмичен бюджет №' + params.number + '.' + params.week, style: 'rowBold', margin: [10, 10, 10, 0] })
    }
    else {
        footer.columns.push({ text: 'Седмичен бюджет №' + params.week, style: 'rowBold', margin: [10, 10, 10, 0] })
    }

    footer.columns.push({ text: 'Всичко с ДДС: ' + total + ' лв.', style: 'rowBold', margin: [ 112, 3, 10, 0] });

    headerColumns.stack.push(footer);

    definition.content[0].columns.push(headerColumns);
    definition.content[0].columns.push(signatureColumns);

    return definition;
}
