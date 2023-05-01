/**
 * Общий перехватчик ошибок для всех конроллеров.
 * При возникновении ошибки в последних, она будет перехвачена
 * и перенаправленна в обработчик ошибок Express через вызов next
 * @param controller - Контроллер
 */
const errorWrapper = (controller) => async (req, res, next) => {
  try {
    await controller(req, res)
  } catch (e) {
    next(e)
  }
}

module.exports = errorWrapper
