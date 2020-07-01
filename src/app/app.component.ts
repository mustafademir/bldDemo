import { Component, OnInit } from '@angular/core';
import { DataService } from './services/dataservice';
import {BelData} from "./domain/belData";
import {FilterUtils} from "primeng/utils";
import {isUndefined} from 'util';
import {MessageService} from 'primeng';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

interface City {
    name: string;
    code: string;
}

interface Year {
    year: number
}

interface CommonDropDown {
    name: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [DataService]
})
export class AppComponent implements OnInit {

    displayDialog: boolean;

    belDatas: BelData[] = [];

    selectedData: BelData;
    selectedCity2: City;
    newCar: boolean;

    cols: any[];

    belCols: any[];
    
    years: Year[];

    names: string[] = ['mustafa', 'demir'];

    selectedName: string;

    selectedYear: Year;

    yearFilter: number;

    yearTimeout: any;

    selectedMahalle: string;

    selectedCadde: string;

    mahalleNames: CommonDropDown[];

    caddeNames: CommonDropDown[];

    tableVisible = false;

    userform: FormGroup;

    submitted: boolean;

    exportColumns: any[];

    constructor(private dataService: DataService,
                private messageService: MessageService,
                private fb: FormBuilder) {
        this.selectedYear = {year: 2000};
        this.years = [{year: 1997},{year: 1998},{year: 1999},{year: 2000},{year: 2001},{year: 2002},{year: 2004},{year: 2005},{year: 2006}];
    }

    ngOnInit() {
        this.dataService.getBelDatas().then(belData => this.belDatas = belData);
        this.userform = this.fb.group({
            'year': new FormControl('', Validators.required),
            'mahalle': new FormControl('', Validators.required),
            'cadde': new FormControl('', Validators.compose([Validators.required])),
        });
        this.cols = [
            { field: 'vin', header: 'Vin' },
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' }
        ];

        this.belCols = [
            { field: 'yil', header: 'Yılı' },
            { field: 'mahalleAdi', header: 'Mahalle Adı' },
            { field: 'cSokakAdi', header: 'Cadde Sokak Adı' },
            { field: 'tur', header: 'Türü' },
            { field: 'acik', header: 'Açıklama' },
            { field: 'ada', header: 'Ada' },
            { field: 'parsel', header: 'Parsel' },
            { field: 'kNo', header: 'Kapı No' },
            { field: 'aKapiNo', header: 'Alt Kapı No' },
            { field: 'tabanDeg', header: 'Taban Degeri	' },
            { field: 'kDeger', header: 'Kirac Degeri' },
            { field: 'sDeger', header: 'Sulak Degeri' },
            { field: 'kurakDeger', header: 'Kurak Degeri' },
        ];
        this.exportColumns = this.belCols.map(col => ({title: col.header, dataKey: col.field}));
        FilterUtils['custom'] = (value, filter): boolean => {
            if (filter === undefined || filter === null || filter.trim() === '') {
                return true;
            }

            if (value === undefined || value === null) {
                return false;
            }

            return parseInt(filter) > value;
        }
    }

    yearChanged() {
        this.mahalleNames = [
            {name: 'mahalle1'},
            {name: 'mahalle2'},
            {name: 'mahalle3'},
            {name: 'mahalle4'},
            {name: 'mahalle5'},
            {name: 'mahalle6'},
            {name: 'mahalle7'},
        ];
    }

    mahalleChanged() {
        this.caddeNames = [
            {name: 'cadde1'},
            {name: 'cadde2'},
            {name: 'cadde3'},
            {name: 'cadde4'},
            {name: 'cadde5'},
            {name: 'cadde6'},
            {name: 'cadde7'},
        ];
    }

    checkNames() {
        if (isUndefined(this.mahalleNames) && isUndefined(this.caddeNames)) {
            this.messageService.add({severity:'success', summary:'Service Message', detail:'Via MessageService'});
        }
    }

    onYearChange(event, dt) {
        if (this.yearTimeout) {
            clearTimeout(this.yearTimeout);
        }

        this.yearTimeout = setTimeout(() => {
            dt.filter(event.value, 'year', 'gt');
        }, 250);
    }

    clearDatas() {
        this.selectedYear = {year: 2000};

        this.selectedMahalle = '';

        this.selectedCadde = '';

        this.mahalleNames = [];

        this.caddeNames = [];

        this.tableVisible = false;
    }

    sendButton() {
        if (isUndefined(this.mahalleNames) && isUndefined(this.caddeNames)) {
            this.messageService.add({severity:'warn', summary:'Hata', detail:'Mahalle ve Cadde Seçmelisiniz'});
        } else {
            this.tableVisible = true;
        }
    }

    onSubmit(value: string) {
        this.submitted = true;
        if (isUndefined(this.mahalleNames) || isUndefined(this.caddeNames) || isUndefined(this.selectedCadde)
        ||  this.selectedMahalle === '' || this.selectedCadde === '') {
            this.messageService.add({severity:'warn', summary:'Hata', detail:'Mahalle ve Cadde Seçmelisiniz'});
        } else {
            this.belDatas = [];
            this.dataService.getBelDatas().then(belData => {
                belData.forEach( data => {
                    console.log(data.yil + " ++ " + this.selectedYear.year);
                   if (Number(data.yil) ==  this.selectedYear.year) {
                       this.belDatas.push(data);
                   }
                });
            });
            this.tableVisible = true;
        }
    }

    exportExcel() {
            const worksheet = xlsx.utils.json_to_sheet(this.getDatas());
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, "TabloExcelDosyası");

    }

    saveAsExcelFile(buffer: any, fileName: string): void {
            let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data: Blob = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }

    getDatas() {
        let datas = [];
        for(let data of this.belDatas) {
            data.yil = data.yil.toString();
            datas.push(data);
        }
        return datas;
    }

    print() {
        if (this.tableVisible) {
            const printContent = document.getElementById("dataTable");
            const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
            WindowPrt.document.write(printContent.innerHTML);
            WindowPrt.document.close();
            WindowPrt.focus();
            WindowPrt.print();
            WindowPrt.close();
        } else {
            this.messageService.add({severity:'warn', summary:'Hata', detail:'Yazdırılacak data yok'});
        }
                /*const doc = new jsPDF.default(0,0);
                doc.autoTable(this.exportColumns, this.belDatas);
                doc.save('primengTable.pdf');*/
    }

}
