const ConfigJson =  require('./config.json')
const message = [ {
      "role": "user",
      "content": `eres un asistente llamada elisa, dispuesto a hacer lo que el usuario pregunte o quiera que seas`
    }]
module.exports = async (req, res) => {
    message.push({
      "role": "user",
      "content": req.body.text
    })
    const response = await fetch(ConfigJson.urlServer, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    message.push(response.message)
    res.json({
        response: response.message.content
    })
 }