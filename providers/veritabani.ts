import {Injectable} from "@angular/core";
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {Platform} from "ionic-angular";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Meditasyon} from "../entities/meditasyon";
import {Storage} from "@ionic/storage";

@Injectable()
export class VeritabaniProvider {

    private veritabani: SQLiteObject;
    private veritabaniHazir: BehaviorSubject<boolean>;
    ms: Meditasyon[];

    constructor(private storage: Storage,
                private sqlite: SQLite,
                private platform: Platform) {

        this.veritabaniHazir = new BehaviorSubject<boolean>(false);
        this.platform.ready().then(() => {
            this.sqlite.create({
                name: 'meditastonVeritabani',
                location: 'default'
            }).then((db: SQLiteObject) => {
                this.veritabani = db;
                this.storage.get('tablohazir').then(durum => {
                    if (durum) {
                        this.veritabaniHazir.next(true);
                    } else {
                        this.veritabani.executeSql('CREATE TABLE veriler(id INTEGER PRIMARY KEY AUTOINCREMENT, baslik TEXT, aciklama TEXT, thumbnail TEXT UNIQUE, sesdosyasi TEXT UNIQUE, favori INTEGER DEFAULT 0, tarih TEXT, kategori INTEGER DEFAULT 0, sira INTEGER DEFAULT 0)', [])
                            .then(() => console.log('Executed SQL'))
                            .catch(e => console.log(e));
                        this.veritabaniHazir.next(true);
                        this.storage.set('tablohazir', true);
                    }
                })
            })
        }).catch(e => console.log(e));
    }

    veriEkle (baslik, aciklama, resim, ses, tarih, kategori, sira) {
        let data = [baslik, aciklama, resim, ses, tarih, kategori, sira];
        return this.veritabani.executeSql('INSERT INTO veriler (baslik, aciklama, thumbnail, sesdosyasi, tarih, kategori, sira) VALUES (?,?,?,?,?,?,?)', data)
            .then(res => {
                console.log(res);
                return res;
            })
            .catch(e => console.log(e));
    }

    favoriGuncelle (sira, durum) {
        return this.veritabani.executeSql('UPDATE veriler SET favori = ? WHERE sira = ?', [durum, sira])
            .then(res => {
                return res;
            })
            .catch(e => console.log(e));
    }

    tumDatayiGetir (kategori) {
        var query: string;
        if (kategori === "0") {
            query = "select * from veriler order by sira desc";
        } else if (kategori === "00") {
            query = "select * from veriler where favori = 1 order by sira desc";
        } else {
            query = "select * from veriler where kategori = " + kategori + " order by sira desc"
        }

        return this.veritabani.executeSql(query, []).then(res => {
            let data = [];
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    data.push({baslik: res.rows.item(i).baslik, aciklama: res.rows.item(i).aciklama, thumbnail: res.rows.item(i).thumbnail,
                        sesdosyasi: res.rows.item(i).sesdosyasi, favori: res.rows.item(i).favori, tarih: res.rows.item(i).tarih,
                        kategori: res.rows.item(i).kategori, sira: res.rows.item(i).sira})
                }
            }
            return data;
        }, hata => {
            console.log('hata geldi', hata);
            return [];
        });
    }

    birDataGetir (sira) {
        return this.veritabani.executeSql('SELECT * FROM veriler WHERE sira = ' + sira, []).then(res => {
            let data = [];
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    data.push({baslik: res.rows.item(i).baslik, aciklama: res.rows.item(i).aciklama, thumbnail: res.rows.item(i).thumbnail,
                        sesdosyasi: res.rows.item(i).sesdosyasi, favori: res.rows.item(i).favori, tarih: res.rows.item(i).tarih,
                        kategori: res.rows.item(i).kategori, sira: res.rows.item(i).sira})
                }
            }
            return data;
        }).catch(e => console.log(e));
    }

    veritabaDurumu () {
        return this.veritabaniHazir.asObservable();
    }
}