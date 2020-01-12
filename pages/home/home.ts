import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {Meditasyon} from "../../entities/meditasyon";
import "rxjs/add/operator/map"
import {ListPage} from "../list/list";
import {VeritabaniProvider} from "../../providers/veritabani";
import {Storage} from "@ionic/storage";
import {AdMobFree, AdMobFreeBannerConfig} from "@ionic-native/admob-free";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    sayfa?: any;
    meditasyonlar: Meditasyon[];
    datalar:any = [];

    constructor(public navCtrl: NavController,
                private navParams: NavParams,
                private http: Http,
                private platform: Platform,
                private storage: Storage,
                private veritabani: VeritabaniProvider,
                private admobFree: AdMobFree) {

        this.storage.get('tablohazir').then(veri => {
            if (veri) {
                this.veritabani.veritabaDurumu().subscribe(hzr => {
                    if (hzr) {
                        if (this.sayfa != null) {
                            this.verileriListele(this.sayfa.kategori)
                        } else {
                            this.verileriListele("0")
                        }
                    }
                })
            }
        });
        this.sayfa = navParams.get('data');
        console.log('Yönlendirmeden Gelen Değer: ' + this.sayfa);
    }

    verileriListele(kategori) {
        this.veritabani.tumDatayiGetir(kategori).then(cvp => {
            this.datalar = cvp
        })
    }

    getMeditasyon(): Observable<Meditasyon[]> {
        return this.http.get("http://mistikyol.com/mistikmobil/mobiljson.php")
            .map(response => response.json())
    }

    getDataFromWeb () {
        this.getMeditasyon().subscribe(p => {
            this.meditasyonlar = p["meditasyonlar"];
            this.veritabani.veritabaDurumu().subscribe(hzr => {
                if (hzr) {
                    for (var i = 0; i < this.meditasyonlar.length; i++) {
                        this.veritabani.veriEkle(this.meditasyonlar[i].baslik, this.meditasyonlar[i].aciklama, this.meditasyonlar[i].thumbnail,
                            this.meditasyonlar[i].sesdosyasi, this.meditasyonlar[i].tarih, this.meditasyonlar[i].kategori, this.meditasyonlar[i].id);
                    }
                }
            });

            console.log(this.meditasyonlar);
        })
    }

    ionViewDidLoad () {

        if (this.platform.is('cordova')) {
            const bannerConfig: AdMobFreeBannerConfig = {
                id: 'ca-app-pub-245634563425463456/4256',
                isTesting: true,
                autoShow: true
            };
            this.admobFree.banner.config(bannerConfig);

            this.admobFree.banner.prepare()
                .then(() => {
                    //reklam hazır
                    console.log('reklam hazır')
                })
                .catch(hata => console.log(hata));
        }
        this.getDataFromWeb();
    }

    goMeditasyon (meditasyon) {
        this.navCtrl.push(ListPage, {
            meditasyon: meditasyon
        })
    }

}
