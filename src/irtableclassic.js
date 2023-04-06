function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

class IrTableClassic {
    constructor(rowsData, columns) {
        this.rowsData = rowsData;
        this.columns = columns;
        this.visibleRows = [];
        this.visibleColumns = [];
    }

    getHtml() {
        let table = document.createElement('table');
        table.classList.add('irtableclassic');
        let tableHead = document.createElement('thead');
        let tableBody = document.createElement('tbody');
        let filterRow = document.createElement('tr');
        let headerRow = document.createElement('tr');
        this.columns.forEach(column => {
            let tableHeader = document.createElement('th');
            let tableHeaderFilter = document.createElement('th');
            let filterInput = document.createElement('input');
            filterInput.setAttribute('type', 'text');
            filterInput.setAttribute('placeholder', `Filter ${column.content}`);
            filterInput.dataset.key = column.key;
            filterInput.addEventListener('keyup', (event) => {
                let filterValue = event.target.value;
            });
            tableHeaderFilter.appendChild(filterInput);
            tableHeader.innerHTML = column.content;
            tableHeader.dataset.key = column.key;
            tableHeader.addEventListener('click', (event) => this.handleHeaderClick(event));
            filterRow.appendChild(tableHeaderFilter);
            headerRow.appendChild(tableHeader);
        });
        tableHead.appendChild(filterRow);
        tableHead.appendChild(headerRow);
        table.appendChild(tableHead);
        this.rowsData.forEach(rowData => {
            let bodyRow = document.createElement('tr');
            this.columns.forEach(column => {
                let bodyRowData = document.createElement('td');
                bodyRowData.innerHTML = rowData[column.key];
                bodyRowData.dataset.key = column.key;
                bodyRow.appendChild(bodyRowData);
            });
            tableBody.appendChild(bodyRow);
        });
        table.appendChild(tableBody);
        return table;
    }

    handleHeaderClick(event) {
        let order = 'asc';
        if (event.target.classList.contains('asc')) order = 'desc';
        else if (event.target.classList.contains('desc')) order = 'asc';
        let tableHeaders = document.querySelectorAll('.irtableclassic th');
        [...tableHeaders].forEach(tableHeader => {
            tableHeader.classList.remove('asc');
            tableHeader.classList.remove('desc');
        });
        event.target.classList.add(order);
        this.orderRowsByColumn(event.target.dataset.key, order);
        this.redraw();
    }

    orderRowsByColumn(columnKey, order) {
        this.rowsData.sort((a, b) => {
            if (a[columnKey] < b[columnKey]) {
                return order === 'asc' ? -1 : 1;
            }
            if (a[columnKey] > b[columnKey]) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    redraw() {
        let table = null;
        let tableBody = null;
        if (document.querySelector('.irtableclassic')) {
            table = document.querySelector('.irtableclassic');
            tableBody = document.querySelector('.irtableclassic tbody');
            table.removeChild(tableBody);
        }
        tableBody = this.getHtml().querySelector('tbody');
        table.appendChild(tableBody);
    }
}