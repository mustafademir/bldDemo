import { Component, OnInit } from '@angular/core';
import { DataService } from './services/dataservice';
import {BelData} from "./domain/belData";
import {FilterUtils} from "primeng/utils";


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

    belDatas: BelData[];

    selectedData: BelData;
    selectedCity2: City;
    newCar: boolean;

    cols: any[];

    belCols: any[];
    
    years: Year[];

    names: string[] = ['mustafa', 'demir'];

    selectedName: string;

    selectedYear = 2000;

    yearFilter: number;

    yearTimeout: any;

    selectedMahalle: string;

    selectedCadde: string;

    mahalleNames: CommonDropDown[];

    caddeNames: CommonDropDown[];

    tableVisible = false;

    constructor(private dataService: DataService) {
        this.years = [{year: 1997},{year: 1998},{year: 1999},{year: 2000},{year: 2001},{year: 2002},{year: 2004},{year: 2005},{year: 2006}];
        this.mahalleNames = [
            {name: 'mahalle1'},
            {name: 'mahalle2'},
            {name: 'mahalle3'},
            {name: 'mahalle4'},
            {name: 'mahalle5'},
            {name: 'mahalle6'},
            {name: 'mahalle7'},
        ];
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

    ngOnInit() {
        this.dataService.getBelDatas().then(belData => this.belDatas = belData);

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

    onYearChange(event, dt) {
        if (this.yearTimeout) {
            clearTimeout(this.yearTimeout);
        }

        this.yearTimeout = setTimeout(() => {
            dt.filter(event.value, 'year', 'gt');
        }, 250);
    }

    clearDatas() {
        this.selectedYear = 2000;

        this.selectedMahalle = '';

        this.selectedCadde = '';
    }

    sendButton() {
        this.tableVisible = true;
    }
}
