import api from '../service/service.js'
import qrcodeVue from 'qrcode-vue'
import axios from 'axios'
import Vueaxios from 'vue-axios'
import Vue from 'vue'

import VueQRCodeComponent from 'vue-qrcode-component'
Vue.component('qr-code', VueQRCodeComponent)

Vue.use(Vueaxios, axios)
var client = require('emitter-io').connect()

export default {
  name: 'index',
  data() {
    return {
      user: '',
      size: 128,
      bgColor: '#fff',
      fgColor: '#000',
      value: 'https://github.com/l-ll/qrcode-vue',
      price: 0,
      qrcodebase64: '',
      qrcode: '',
      count: 180,
    }
  },
  components: {
    qrcodeVue
  },
  methods: {
    goto(historz) {
      this.$router.push(historz)
    },
    runtime() {
      if (this.price <= 0) {
        alert('กรุณากรอกจำนวนเงิน')
        return
      }
      $('#myModal').modal({
        backdrop: false
      })

      console.log('call apix')
      var resultbath = this.convertbath(this.price)
      console.log('resultbath:' + (resultbath))
      var payload = {
        vending_uuid: "testing",
        order_uuid: "testing123",
        amount: this.price,
        client_name:"MAKEKAFE",
        terminal_id:"0001"
      }
      console.log(JSON.stringify(payload))
      api.callqrcode(payload,
        (result) => {
          if (result.status === 'success') {
            console.log(result)
            console.log('channel sub:' + result.sub_channel)
            this.qrcode = result.qr_tag
            console.log("qrimage" + result.qr_image)

            this.qrcodebase64 = 'data:image/png;base64,' + result.qr_image

            client.subscribe({
              key: "aArZ5ThGcFCRJ0UumrK6YcssjRhAmEKD",
              channel: result.sub_channel
            });
          }
        },
        (error) => {
          console.log(error)
        })

      var test = setInterval(function () {
        $("#counter").html(this.count--);
        if (this.count == 0) {
          swal("Time Out!", "Try Again!", "error");
          window.clearInterval(test);
        }
      }.bind(this), 1000);
    },
    convertbath(val) {
      var x = numeral(val).format('0,0.00');
      return x
    },
    button_clearvalue() {
      document.getElementById('fname').value = 0;
    },
    removetime() {
      location.reload();
    },
    myFunction(cccc) {
      var x = document.getElementById("fname");
      var string = numeral(x.value).format('0,0');
      x.value = string;
    },
  },
  mounted() {
    this.button_clearvalue()
    this.myFunction()
    // alert('dasd')
    client.on('message', function (msg) {
      var msg = msg.asObject()
      console.log(JSON.stringify(msg))
      if (msg.status === 'success') {
        if (msg.message === 'payment success') {
          swal("Success Payment!", " วันที่ : " + msg.confirmed_at.substring(0, 19), "success").then(function () {
            location.reload();
          });
        }
      } else {
        swal("Error Payment!", "Try Again !!!", "error").then(function(){
          location.reload();
        });

      }
    })

  }
}