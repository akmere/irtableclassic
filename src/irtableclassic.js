function getContentWidth(element) {
    var styles = getComputedStyle(element)

    // return element.clientWidth
    //     - parseFloat(styles.paddingLeft)
    //     - parseFloat(styles.paddingRight)
    return element.offsetWidth;
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function measure(el, fn) {
    let clone = el.cloneNode(true);
    clone.style.width = 'fit-content';
    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    document.body.appendChild(clone);
    var result = fn(clone);
    clone.parentNode.removeChild(clone);
    return result;
}

class IrTableClassic {
    constructor(rowsData, columns, container, { pagination = null, rowHeight = '50px', minRowHeight = '10px',maxHeight = null, headerHeight = null, filterHeight = '30px', minWidth = null, height = null, selectableRows = false, filteredByDefault = true, fitRowHeight = false, fitRowWidth = false }) {
        this.rowsData = rowsData;
        this.rowsData.forEach((rowData, index) => {
            rowData.hiddenByFiltersList = [];
            if (!rowData.index) rowData.index = index;
        });
        this.columns = columns;
        this.columns.forEach(column => {
            column.order = null;
            if (column.filtered === undefined) column.filtered = filteredByDefault;
        });
        if (pagination) this.paginationMax = pagination;
        else this.paginationMax = this.rowsData.length;
        this.paginationRange = [0, this.paginationMax - 1];
        this.visibleRows = this.rowsData;
        this.visibleColumns = [];
        this.container = container;
        this.rowHeight = rowHeight;
        this.minRowHeight = minRowHeight;
        this.headerHeight = headerHeight;
        this.filterHeight = filterHeight;
        this.minWidth = minWidth;
        this.maxHeight = maxHeight;
        this.fitRowHeight = fitRowHeight;
        this.selectableRows = selectableRows;
        this.fitRowWidth = fitRowWidth;
        this.fitColumnWidths = {};
        if (height == 'match' && pagination) this.height = pagination * parseInt(rowHeight) + parseInt(headerHeight) + parseInt(filterHeight) + 'px';
        else if (height == 'match') this.height = this.rowsData.length * parseInt(rowHeight) + parseInt(headerHeight) + parseInt(filterHeight) + 'px';
        else if (height) this.height = height;
    }

    getHtml() {
        let tableElement = document.createElement('div');
        tableElement.classList.add('irtableclassic-container');
        let table = document.createElement('div');
        table.classList.add('irtableclassic');
        if (this.minWidth) tableElement.style.minWidth = this.minWidth;
        if (this.height) tableElement.style.height = this.height;
        let tableHead = document.createElement('div');
        tableHead.classList.add('irtableclassic-head');
        let tableBody = document.createElement('div');
        tableBody.classList.add('irtableclassic-body');
        let tableFooter = document.createElement('div');
        tableFooter.classList.add('irtableclassic-footer');
        let filterRow = document.createElement('div');
        filterRow.classList.add('irtableclassic-filter');
        filterRow.style.height = this.filterHeight;
        let headerRow = document.createElement('div');
        headerRow.classList.add('irtableclassic-header');
        if (this.headerHeight) headerRow.style.height = this.headerHeight;
        this.columns.forEach(column => {
            let tableHeader = document.createElement('div');
            tableHeader.classList.add('irtableclassic-header-cell');
            tableHeader.classList.add('irtableclassic-cell');
            let tableHeaderFilter = document.createElement('div');
            tableHeaderFilter.classList.add('irtableclassic-filter-cell');
            tableHeaderFilter.classList.add('irtableclassic-cell');
            tableHeaderFilter.dataset.key = column.key;
            if (column.filtered) {
                let filterInput = document.createElement('input');
                filterInput.style.width = '100%';
                filterInput.setAttribute('type', 'text');
                filterInput.setAttribute('placeholder', `Filter ${column.content}`);
                filterInput.dataset.key = column.key;
                filterInput.addEventListener('keyup', (event) => {
                    let filterValue = event.target.value;
                    this.rowsData.forEach(rowData => {
                        if (filterValue == '') {
                            if (rowData.hiddenByFiltersList.indexOf(event.target.dataset.key) > -1) rowData.hiddenByFiltersList.splice(rowData.hiddenByFiltersList.indexOf(event.target.dataset.key), 1);
                        }
                        else if (rowData[event.target.dataset.key] === null || rowData[event.target.dataset.key] === undefined) {
                            if (rowData.hiddenByFiltersList.indexOf(event.target.dataset.key) == -1) rowData.hiddenByFiltersList.push(event.target.dataset.key);
                        }
                        else if (rowData[event.target.dataset.key].toString().indexOf(filterValue) > -1) {
                            if (rowData.hiddenByFiltersList.indexOf(event.target.dataset.key) > -1) rowData.hiddenByFiltersList.splice(rowData.hiddenByFiltersList.indexOf(event.target.dataset.key), 1);
                        } else {
                            if (rowData.hiddenByFiltersList.indexOf(event.target.dataset.key) == -1) rowData.hiddenByFiltersList.push(event.target.dataset.key);
                        }
                    });
                    this.updateVisibleRows();
                    this.redraw();
                });
                tableHeaderFilter.appendChild(filterInput);
            }
            tableHeader.innerHTML = column.content;
            tableHeader.dataset.key = column.key;
            tableHeader.addEventListener('click', (event) => this.handleHeaderClick(event));
            filterRow.appendChild(tableHeaderFilter);
            headerRow.appendChild(tableHeader);
        });
        tableHead.appendChild(filterRow);
        tableHead.appendChild(headerRow);
        table.appendChild(tableHead);
        this.updateSortOrder();
        this.updateVisibleRows();
        this.visibleRows.slice(0).splice(this.paginationRange[0], this.paginationRange[1] - this.paginationRange[0] + 1).forEach(rowData => {
            let bodyRow = document.createElement('div');
            bodyRow.dataset.index = rowData.index;
            bodyRow.classList.add('irtableclassic-data-row');
            bodyRow.style.height = this.rowHeight;
            if (this.fitRowHeight) bodyRow.style.height = null;
            if (this.selectableRows) {
                bodyRow.classList.add('irtableclassic-selectable');
                bodyRow.addEventListener('click', (event) => {
                    let wasSelected = bodyRow.classList.contains('row-selected');
                    if (event.ctrlKey) {
                        if (bodyRow.classList.contains('row-selected')) bodyRow.classList.remove('row-selected');
                        else bodyRow.classList.add('row-selected');
                    }
                    else {
                        let selectedRows = document.querySelectorAll('.irtableclassic-selectable.row-selected');
                        selectedRows.forEach(selectedRow => {
                            selectedRow.classList.remove('row-selected');
                        });
                        if (!wasSelected) bodyRow.classList.add('row-selected');
                    }
                    tableElement.dispatchEvent(new CustomEvent('rowSelection', { detail: { rowsSelected: [...document.querySelectorAll('.irtableclassic-selectable.row-selected')].map(row => row.dataset.index) } }));
                });
            }
            console.log(this.rowHeight);
            this.columns.forEach(column => {
                let bodyRowData = document.createElement('div');
                bodyRowData.classList.add('irtableclassic-data-cell');
                bodyRowData.classList.add('irtableclassic-cell');
                // bodyRowData.style.minHeight = this.minRowHeight;
                if(rowData[column.key] !== undefined && rowData[column.key] !== null) bodyRowData.innerHTML = rowData[column.key];
                bodyRowData.dataset.key = column.key;
                if (this.fitRowHeight) bodyRowData.style.height = 'fit-content';
                bodyRow.appendChild(bodyRowData);
            });
            tableBody.appendChild(bodyRow);
        });
        table.appendChild(tableBody);
        tableElement.appendChild(table);
        let paginationElement = document.createElement('div');
        paginationElement.classList.add('irtableclassic-pagination');
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
        table.appendChild(tableFooter);

        this.columns.forEach(column => {
            [...tableElement.querySelectorAll(`.irtableclassic-cell[data-key="${column.key}"]`)].forEach(cell => {
                cell.style.flex = column.flex ? column.flex : '1 1 0';
                cell.style.width = '0';
            });
        });

        this.columns.forEach(column => {
            if (this.fitRowWidth) {
                let biggestWidth = this.getWidthToMatchOfColumn(column.key, tableElement);
                [...tableElement.querySelectorAll(`.irtableclassic-cell[data-key="${column.key}"]`)].forEach(cell => {
                    cell.style.minWidth = `${biggestWidth}px`;
                });
            }
        });

        return tableElement;
    }

    getWidthToMatchOfColumn(columnKey, tableElement) {
        if(this.fitColumnWidths[columnKey]) return this.fitColumnWidths[columnKey];
        let columnInTable = [...tableElement.querySelectorAll(`.irtableclassic-header-cell[data-key="${columnKey}"]`)][0];
        let filterCell = [...tableElement.querySelectorAll(`.irtableclassic-filter-cell[data-key="${columnKey}"]`)][0];

        let rowDataOfLongestText = this.rowsData.reduce((max, row) => {
            let htmlElement = htmlToElement(`<div>${row[columnKey]}</div>`);
            let text = htmlElement.innerText;
            let longestWord = text.split(' ').reduce((max, word) => {
                if (word.length > max.length) return word;
                else return max;
            }, '');
            let textLength = longestWord.length;
            if (textLength > max.length) return longestWord;
            else return max;
        }, '');
        console.log(`rowDataOfLongestText: ${rowDataOfLongestText}`);

        let rowDataOfLongestHtml = this.rowsData.reduce((max, row) => {
            if (row[columnKey]) {
                let htmlLength = row[columnKey].toString().length;
                if (htmlLength > max) return row[columnKey];
                else return max;
            } else return max;
        }, 0);
        let biggestCell = document.createElement('div');
        biggestCell.innerHTML = 'w'.repeat(rowDataOfLongestText.length);
        let biggestWidth = measure(biggestCell, el => getContentWidth(el));
        let columnWidth = measure(columnInTable, el => getContentWidth(el));
        if(columnWidth > biggestWidth) biggestWidth = columnWidth;
        this.fitColumnWidths[columnKey] = biggestWidth;
        return biggestWidth;
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
        let redrawHead = false;
        let table = null;
        let tableHead = null;
        let tableBody = null;
        let paginationElement = null;
        let tableFooter = null;
        let irtableclassicContainer = this.container.querySelector('.irtableclassic-container');
        if (this.container.querySelector('.irtableclassic')) {
            table = this.container.querySelector('.irtableclassic');
            tableHead = this.container.querySelector('.irtableclassic-head');
            tableBody = this.container.querySelector('.irtableclassic-body');
            paginationElement = this.container.querySelector('.irtableclassic-pagination');
            tableFooter = this.container.querySelector('.irtableclassic-footer');
            if(redrawHead) table.removeChild(tableHead);
            table.removeChild(tableFooter);
            table.removeChild(tableBody);
        }
        let newHtml = this.getHtml();
        if(redrawHead) tableHead = newHtml.querySelector('.irtableclassic-head');
        tableBody = newHtml.querySelector('.irtableclassic-body');
        tableFooter = newHtml.querySelector('.irtableclassic-footer');
        if(redrawHead) table.appendChild(tableHead);
        table.appendChild(tableBody);
        table.appendChild(tableFooter);
    }

    initialize() {
        this.container.replaceChildren(this.getHtml());
    }
}