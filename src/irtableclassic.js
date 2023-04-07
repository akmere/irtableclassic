function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

class IrTableClassic {
    constructor(rowsData, columns, pagination = null) {
        this.rowsData = rowsData;
        this.rowsData.forEach(rowData => {
            rowData.hiddenByFiltersList = [];
        });
        this.columns = columns;
        this.columns.forEach(column => {
            column.order = null;
        });
        if (pagination) this.paginationMax = 10;
        else this.paginationMax = this.rowsData.length;
        this.paginationRange = [0, this.paginationMax - 1];
        this.visibleRows = this.rowsData;
        this.visibleColumns = [];
    }

    getHtml() {
        let tableElement = document.createElement('div');
        tableElement.classList.add('irtableclassic-container');
        let table = document.createElement('table');
        table.classList.add('irtableclassic');
        let tableHead = document.createElement('thead');
        let tableBody = document.createElement('tbody');
        let tableFooter = document.createElement('div');
        tableFooter.classList.add('irtableclassic-footer');
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
                console.log(this.rowsData);
                this.rowsData.forEach(rowData => {
                    if (rowData[event.target.dataset.key] && rowData[event.target.dataset.key].toString().indexOf(filterValue) > -1) {
                        if (rowData.hiddenByFiltersList.indexOf(event.target.dataset.key) > -1) rowData.hiddenByFiltersList.splice(rowData.hiddenByFiltersList.indexOf(event.target.dataset.key), 1);
                    } else {
                        if (rowData.hiddenByFiltersList.indexOf(event.target.dataset.key) == -1) rowData.hiddenByFiltersList.push(event.target.dataset.key);
                    }
                });
                this.updateVisibleRows();
                this.redraw();
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
        this.updateVisibleRows();
        this.updateSortOrder();
        this.visibleRows.slice(0).splice(this.paginationRange[0], this.paginationRange[1] - this.paginationRange[0] + 1).forEach(rowData => {
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
        tableElement.appendChild(table);
        let paginationElement = document.createElement('div');
        paginationElement.classList.add('irtableclassic-pagination');
        console.log('visible rows');
        console.log(this.visibleRows);
        console.log('all rows');
        console.log(this.rowsData);
        paginationElement.innerHTML = `${this.paginationRange[0] + 1}-${Math.min(this.paginationRange[1] + 1, this.visibleRows.length)} of ${this.visibleRows.length}`;
        let buttonPreviousPage = document.createElement('button');
        let buttonNextPage = document.createElement('button');
        buttonPreviousPage.innerText = '<';
        buttonNextPage.innerText = '>';
        buttonPreviousPage.onclick = () => {
            if (this.paginationRange[0] - this.paginationMax >= 0) {
                this.updatePagination(this.paginationRange[0] - this.paginationMax);
            }
        };
        buttonNextPage.onclick = () => {
            let newStart = this.paginationRange[0] + this.paginationMax;
            if (newStart < this.visibleRows.length) this.updatePagination(newStart);
        };
        tableFooter.appendChild(paginationElement);
        tableFooter.appendChild(buttonPreviousPage);
        tableFooter.appendChild(buttonNextPage);
        tableElement.appendChild(tableFooter);
        return tableElement;
    }

    updateSortOrder() {
        this.columns.forEach(column => {
            if (column.order) {
                this.orderRowsByColumn(column.key, column.order);
            }
        });
    }

    updatePagination(start) {
        this.updateVisibleRows();
        let max = Math.min(start + this.paginationMax - 1, this.visibleRows.length - 1);
        this.paginationRange = [start, max];
        this.redraw();
    }

    updateVisibleRows() {
        this.visibleRows = this.rowsData.filter(rowData => rowData.hiddenByFiltersList.length == 0);
        if (this.paginationRange[0] > this.visibleRows.length) {
            this.paginationRange[0] = Math.floor(this.visibleRows.length / this.paginationMax) * this.paginationMax;
            this.paginationRange[1] = this.visibleRows.length - 1;
        }
        if (this.paginationRange[1] - this.paginationRange[0] + 1 < this.paginationMax) {
            this.paginationRange[1] = Math.min(this.paginationRange[0] + this.paginationMax - 1, this.visibleRows.length - 1);
        }
    }

    handleHeaderClick(event) {
        let order = 'asc';
        let currentOrder = this.columns.find(column => column.key == event.target.dataset.key).order;
        if (currentOrder == 'desc' || currentOrder == null) {
            order = 'asc';
        }
        else order = 'desc';
        this.columns.forEach(column => {
            column.order = null;
        });
        this.columns.find(column => column.key == event.target.dataset.key).order = order;
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
        let paginationElement = null;
        let tableFooter = null;
        let irtableclassicContainer = document.querySelector('.irtableclassic-container');
        if (document.querySelector('.irtableclassic')) {
            table = document.querySelector('.irtableclassic');
            tableBody = document.querySelector('.irtableclassic tbody');
            paginationElement = document.querySelector('.irtableclassic-pagination');
            tableFooter = document.querySelector('.irtableclassic-footer');
            irtableclassicContainer.removeChild(tableFooter);
            table.removeChild(tableBody);
        }
        let newHtml = this.getHtml();
        tableBody = newHtml.querySelector('tbody');
        tableFooter = newHtml.querySelector('.irtableclassic-footer');
        table.appendChild(tableBody);
        irtableclassicContainer.appendChild(tableFooter);
    }
}