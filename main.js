// Hàm thực hiên check người dùng có nhập gì hay không để thông báo error
function Validator(options) {
  // Kiểm tra parentElement
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRule = {}
  function validate(inputElement,rule) { 
    var errorMessage;
    var errorElement = getParent(inputElement,options.formGroup).querySelector(options.errorSelector)
    // Lấy ra các rule của selector
    var rules = selectorRule[rule.selector]
    //  Lặp qua từng rule và kiểm tra nếu có lỗi thì dừng 
    for (var i = 0;i < rules.length ; i++) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          )
          break;
        default:
          errorMessage = rules[i](inputElement.value)
      }
      if (errorMessage) break ;
    } 

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement,options.formGroup).classList.add('invalid')
    } else {
      errorElement.innerText = '';
      getParent(inputElement,options.formGroup).classList.remove('invalid')
    }
    return !errorMessage;

  }
  // Lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isSuccess = true;
      // validate cho từng rule
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector)
        var success = validate(inputElement,rule)
        if (!success) {
          isSuccess = false;
        } 
      });
      if (isSuccess) {
        if (typeof options.onSubmit === "function") {
          var dataInputs = formElement.querySelectorAll('[name]');
          var formValue = Array.from(dataInputs).reduce(function (values,input) {
            switch (input.type) {
              case 'radio':
                if (input.matches(':checked')) {
                  values[input.name] = input.value;
                }
                break;
              case 'checkbox':
                
                if (!input.matches(':checked')) {
                  values[input.name] = '';
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = []
                }
                values[input.name].push(input.value);
                break;
              case 'file':
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },{});
          options.onSubmit(formValue)
        } else {
          formElement.submit();
        }
      }
    }
    options.rules.forEach(function (rule) {
      // Lưu lại các rule 
      if (Array.isArray(selectorRule[rule.selector])) {
        selectorRule[rule.selector].push(rule.test);
      } else {
        selectorRule[rule.selector] = [rule.test];
      };

      var inputElements = formElement.querySelectorAll(rule.selector)
      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          //  Xử lý trương hợp blur ra ngoài
          inputElement.onblur = function () {
            validate(inputElement,rule)
          }
          //  Xử lý trường hơp khi người dùng đang nhập
          inputElement.oninput = function () {
            var errorElement = getParent(inputElement,options.formGroup).querySelector(options.errorSelector);
            errorElement.innerText = '';
            getParent(inputElement,options.formGroup).classList.remove('invalid');
          }
        }
      }) 
    });
  }
}

Validator.isRequired = function(selector,message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || 'Vui lòng nhập học và tên'
    }
  }
}

Validator.isEmail = function(selector,message) {
  return {
    selector: selector,
    test: function (value) {
      var ragex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return ragex.test(value) ? undefined : message || "Vui lòng nhập Email";
    }
  }
}

Validator.isPassword = function(selector,min,message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : message ||` Vui lòng nhập tối thiểu ${min} ký tự`;
    }
  }
}

Validator.isConfirmed = function (selector,getConfirmValue,message) { 
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue() ? undefined : message || "Vui lòng nhập đúng mật khẩu bên trên ";
    }
  }

}