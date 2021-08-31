var express = require('express');
var router = express.Router();
var pagarme = require('../lib/pagarme');



/* POST criação de compra. */
router.post('/', function (req, res, next) {
    
  pagarme.compra(req.body).then((result) => {
    const paymentId = result.Payment.PaymentId;
    pagarme.captura(paymentId)
      .then((result) => {
        if (result.status == 2) {
          res.status(201).send({
            "Status": "Sucesso",
            "Message": "Compra realizada com sucesso.",
            "CompraId": paymentId
          });
        }
        else {
          res.status(402).send({
            "Status": "Falhou",
            "Message": "Compra não realizada."
          });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .catch(function (error) {
        console.error(error);
  });
});

/* GET status de compra. */
router.get('/:compra_id/status', function (req, res, next) {
  pagarme.consulta(req.params.compra_id)
    .then((result) => {

      let message = {};

      switch (result.Payment.Status) {
        case 1:
          message = {
            'Status': 'Pagamento autorizado.'
          };
          break;
        case 2:
          message = {
            'Status': 'Pagamento realizado.'
          };
          break;
        case 12:
          message = {
            'Status': 'Pagamento pendente.'
          };
          break;
        default:
          message = {
            'Status': 'Pagamento falhou.'
          };
      }
      res.send(message);
    });
});

module.exports = router;
});