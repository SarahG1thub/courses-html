// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function wait_for_element_to_exist(selector)
{
  return new Promise(resolve => {
    if ( document.querySelector(selector) ) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if ( document.querySelector(selector) ) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get 'parameter 1 is not of type 'Node'' error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.documentElement, {
      childList : true,
      subtree   : true
    });
  });
}
