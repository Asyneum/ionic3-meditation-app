import {Component} from '@angular/core';
import {NavController, NavParams, ToastController, Platform} from 'ionic-angular';
import {VeritabaniProvider} from "../../providers/veritabani";
import {AdMobFree, AdMobFreeBannerConfig} from "@ionic-native/admob-free";

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage {

    meditasyon: any;
    data:any;

    sure: number;
    anlik: number;

    toplamSure: string = "00:00";
    anlikSure: string = "00:00";

    isPlay:boolean = false;

    player = new Audio();

    artirmaSayisi: number;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private veritabani: VeritabaniProvider,
                private toastKontrol: ToastController,
                private admobFree: AdMobFree,
                private platform: Platform) {
        // If we navigated to this page, we will have an item available as a nav param
        this.meditasyon = navParams.get('meditasyon');

        this.veritabani.veritabaDurumu().subscribe(hzr => {
            if (hzr) {
                this.meditasyonuGetir(this.meditasyon.sira);
            }
        })

    }

    meditasyonuGetir(sira) {
        this.veritabani.birDataGetir(sira).then( cvp => {
            this.data = cvp;
            console.log(cvp);
        })
    }

    favorilereEkle(sira) {
        this.veritabani.favoriGuncelle(sira, "1");
        this.meditasyonuGetir(sira);
        this.toastYap("Favorilerinize eklendi")
    }

    favorilerdenCikar(sira) {
        this.veritabani.favoriGuncelle(sira, "0");
        this.meditasyonuGetir(sira);
        this.toastYap("Favorilerinizden çıkarıldı")
    }

    toastYap (msg) {
        let toast = this.toastKontrol.create({
            message: msg,
            duration: 2000,
            position: 'top'
        });
        toast.present()
    }

    ionViewDidLoad() {
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
        this.player.src = "http://mistikyol.com/mistikmobil/audios/" + this.meditasyon.sesdosyasi;
    }

    playPause () {
        if (this.isPlay) {
            this.player.pause();
            this.isPlay = false;
        } else {
            this.player.play();
            this.isPlay = true;
        }

        this.timerBaslat();
        if (this.player.readyState > 0) {
            this.sure = this.player.duration;
            if (this.sure < 19589.733875) {
                this.toplamSure = this.formatTime(this.player.duration);
            }
        }
    }

    formatTime (ms: number): string {
        let dakika: any = Math.floor(ms / 60);
        let saniye: any = Math.floor(ms % 60);

        if (dakika < 10) {
            dakika = '0' + dakika
        }

        if (saniye < 10) {
            saniye = '0' + saniye
        }

        return dakika + ':' + saniye
    }

    timerBaslat () {
        this.artirmaSayisi = setInterval(() => {
            this.anlikSureyiGetir()
        }, 1000)
    }

    anlikSureyiGetir () {
        this.anlik = this.player.currentTime;
        this.anlikSure = this.formatTime(this.player.currentTime);
    }
}
