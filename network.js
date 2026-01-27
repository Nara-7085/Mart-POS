
var setVanta = ()=>{
if (window.VANTA) window.VANTA.NET({
  el: ".s-page-1 .s-section-1 .s-section",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.0,
  minWidth: 200.0,
  scale: 1.0,
  scaleMobile: 1.0,
  color: 0x3fbdff,
  backgroundColor: 0x0,
});
}
_strk.push(function() {
  setVanta()
  window.edit_page.Event.subscribe( "Page.beforeNewOneFadeIn", setVanta )
})
