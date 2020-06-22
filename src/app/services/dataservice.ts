import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BelData} from "../domain/belData";

@Injectable()
export class DataService {

    constructor(private http: HttpClient) {}

    getBelDatas() {
        return this.http.get<any>('assets/data/datas.json')
            .toPromise()
            .then(res => <BelData[]> res.data)
            .then(data => data);
    }
}
