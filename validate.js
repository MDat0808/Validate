function Validator(formSelector,options = {}) {
    var _this = this

    function getParent(element,selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var formRules = {};

    var validatorRules = {
        required : function (value) {
            return value ? undefined : 'Vui lòng nhập nội dung'
        },
        email : function (value) {
            var ragex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return ragex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min : function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        }
    }
    // Lấy ra các element trong DOM theo `formSelector`
    var formElement = document.querySelector(formSelector)
    //  Chỉ xử lý khi có element trong DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        for ( var input of inputs) {
            var rules = input.getAttribute('rules').split('|')
            for (var rule of rules ) {

                var isRuleHasValue = rule.includes(':')
                var ruleInfor;

                if (isRuleHasValue) {
                    ruleInfor = rule.split(':')
                    rule = ruleInfor[0]
                }

                var ruleFunc = validatorRules[rule]

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfor[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            // Lắng nghe các sư kiện đẻ validate 
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(e) {
            var rules = formRules[e.target.name]
            var errorMessage;

            rules.some(function (rule) {
                errorMessage = rule(e.target.value);
                return errorMessage;
            });

            // Nếu có lỗi thì hiển thị errorMessage
            if (errorMessage) {
                var formGroup = getParent(e.target,'.form-group')

                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }
            return !errorMessage;
        }

        function handleClearError(e) {
            var formGroup = getParent(e.target,'.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')

                if (formMessage) {
                    formMessage.innerText = ''
                }
            }
        }
    }

    // Xử lý khi submit
    formElement.onsubmit = function (e) {
        e.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true;
        for (var input of inputs) {
            if (!handleValidate({target:input})) {
                isValid = false;
            }
        }
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
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
                _this.onSubmit(formValue);
            } else {
                formElement.onSubmit
            }


        }
    }
}