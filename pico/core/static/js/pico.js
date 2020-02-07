(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var EventEmitter =
  /*#__PURE__*/
  function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      this.__callbacks = {};
    }

    _createClass(EventEmitter, [{
      key: "on",
      value: function on(event, callback) {
        if (typeof this.__callbacks[event] === 'undefined') {
          this.__callbacks[event] = [];
        }

        this.__callbacks[event].push(callback);

        return this;
      }
    }, {
      key: "off",
      value: function off(event, callback) {
        var cbs = this.__callbacks[event];

        if (typeof cbs === 'undefined') {
          return this;
        }

        var newCallbacks = [];

        if (typeof callback !== 'undefined') {
          for (var i = 0; i < cbs.length; i++) {
            if (cbs[i] !== callback) {
              newCallbacks.push(cbs[i]);
            }
          }
        }

        this.__callbacks[event] = newCallbacks;
        return this;
      }
    }, {
      key: "emit",
      value: function emit(event) {
        var cbs = this.__callbacks[event];
        var args = Array.from(arguments).slice(1);

        if (typeof cbs !== 'undefined') {
          for (var i = 0; i < cbs.length; i++) {
            cbs[i].apply(this, args);
          }
        }

        return this;
      }
    }]);

    return EventEmitter;
  }();

  var App =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(App, _EventEmitter);

    function App(_ref) {
      var _this;

      var plugins = _ref.plugins,
          views = _ref.views;

      _classCallCheck(this, App);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(App).call(this));
      _this.__plugins = [];
      _this.__views = [];

      if (Array.isArray(plugins)) {
        plugins.forEach(function (Plugin) {
          var plugin = new Plugin(_assertThisInitialized(_this));

          _this.__plugins.push(plugin);
        });
      }

      if (Array.isArray(views)) {
        views.forEach(function (View) {
          var view = new View(_assertThisInitialized(_this));

          _this.__views.push(view);
        });
      }

      _this.$ = window.$;

      _this.$(document).ready(function () {
        _this.ready();
      });

      return _this;
    }

    _createClass(App, [{
      key: "ready",
      value: function ready() {
        var body = this.$('body');

        this.__views.forEach(function (view) {
          var classes = view.classNames();
          var mismatch = false;
          classes.forEach(function (cls) {
            if (mismatch) {
              return;
            }

            if (!body.hasClass(cls)) {
              mismatch = true;
            }
          });

          if (!mismatch) {
            view.ready();
          }
        });

        this.emit('ready');
      }
    }]);

    return App;
  }(EventEmitter);

  var PluginBase =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(PluginBase, _EventEmitter);

    function PluginBase(app) {
      var _this;

      _classCallCheck(this, PluginBase);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PluginBase).call(this));
      _this.app = app;
      app.on('ready', _this.ready);
      return _this;
    }

    _createClass(PluginBase, [{
      key: "ready",
      value: function ready() {}
    }]);

    return PluginBase;
  }(EventEmitter);

  var ValidatorBase =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(ValidatorBase, _EventEmitter);

    function ValidatorBase() {
      _classCallCheck(this, ValidatorBase);

      return _possibleConstructorReturn(this, _getPrototypeOf(ValidatorBase).apply(this, arguments));
    }

    _createClass(ValidatorBase, [{
      key: "check",
      value: function check(value) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          _this.emit('validating');

          _this.validate(value).then(function (valid) {
            _this.emit('valid');

            resolve(valid);
          }).catch(function (err) {
            _this.emit('invalid', err);

            reject(err);
          });
        });
      }
    }, {
      key: "validate",
      value: function validate() {
        throw new Error('Method not implemented');
      }
    }]);

    return ValidatorBase;
  }(EventEmitter);

  var REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var EmailValidator =
  /*#__PURE__*/
  function (_ValidatorBase) {
    _inherits(EmailValidator, _ValidatorBase);

    function EmailValidator() {
      _classCallCheck(this, EmailValidator);

      return _possibleConstructorReturn(this, _getPrototypeOf(EmailValidator).apply(this, arguments));
    }

    _createClass(EmailValidator, [{
      key: "validate",
      value: function validate(email) {
        return new Promise(function (resolve, reject) {
          var str = String(email).toLowerCase();

          if (!REGEX.test(str)) {
            reject(new Error('This doesn\'t look like an email address.'));
          } else {
            resolve(str);
          }
        });
      }
    }]);

    return EmailValidator;
  }(ValidatorBase);

  var UniqueValidator =
  /*#__PURE__*/
  function (_ValidatorBase) {
    _inherits(UniqueValidator, _ValidatorBase);

    function UniqueValidator(basis) {
      var _this;

      _classCallCheck(this, UniqueValidator);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(UniqueValidator).call(this));
      _this.basis = basis;
      return _this;
    }

    _createClass(UniqueValidator, [{
      key: "validate",
      value: function validate(value) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          var socket = new WebSocket("ws://".concat(window.location.host, "/ws/unique/").concat(_this2.basis, "/"));
          var resolved = false;
          var rejected = false;

          socket.onclose = function () {
            if (!rejected && !resolved) {
              reject(new Error('An error occurred while communicating with the server.'));
            }
          };

          socket.onmessage = function (e) {
            var data = JSON.parse(e.data);

            if (data.valid) {
              if (!rejected && !resolved) {
                resolved = true;
                socket.close();
                resolve(value);
              }
            } else if (!rejected && !resolved) {
              rejected = true;
              socket.close();
              reject(new Error(data.error));
            }
          };

          socket.onopen = function () {
            socket.send(value);
          };
        });
      }
    }]);

    return UniqueValidator;
  }(ValidatorBase);

  var PairlValidator =
  /*#__PURE__*/
  function (_ValidatorBase) {
    _inherits(PairlValidator, _ValidatorBase);

    function PairlValidator(value) {
      var _this;

      _classCallCheck(this, PairlValidator);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PairlValidator).call(this));
      _this.checkAgainst = value;
      return _this;
    }

    _createClass(PairlValidator, [{
      key: "validate",
      value: function validate(value) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          if (value !== _this2.checkAgainst) {
            reject(new Error('This value doesn\'t match the previous one.'));
          } else {
            resolve(value);
          }
        });
      }
    }]);

    return PairlValidator;
  }(ValidatorBase);

  var ServerValidator =
  /*#__PURE__*/
  function (_ValidatorBase) {
    _inherits(ServerValidator, _ValidatorBase);

    function ServerValidator(basis) {
      var _this;

      _classCallCheck(this, ServerValidator);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ServerValidator).call(this));
      _this.basis = basis;
      return _this;
    }

    _createClass(ServerValidator, [{
      key: "validate",
      value: function validate(value) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          var socket = new WebSocket("ws://".concat(window.location.host, "/ws/validate/").concat(_this2.basis, "/"));
          var resolved = false;
          var rejected = false;

          socket.onclose = function () {
            if (!rejected && !resolved) {
              reject(new Error('An error occurred while communicating with the server.'));
            }
          };

          socket.onmessage = function (e) {
            var data = JSON.parse(e.data);

            if (data.valid) {
              if (!rejected && !resolved) {
                resolved = true;
                socket.close();
                resolve(value);
              }
            } else if (!rejected && !resolved) {
              rejected = true;
              socket.close();
              reject(new Error(data.error));
            }
          };

          socket.onopen = function () {
            socket.send(value);
          };
        });
      }
    }]);

    return ServerValidator;
  }(ValidatorBase);

  var WizardStep =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(WizardStep, _EventEmitter);

    function WizardStep(wizard, dom) {
      var _this;

      _classCallCheck(this, WizardStep);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WizardStep).call(this));

      var submit = function submit() {
        var buttons = dom.find('button, input[type="button"]').attr('disabled', 'disabled');
        var inputs = dom.find(':input').not(buttons).not('[disabled]');

        var enable = function enable() {
          buttons.removeAttr('disabled');
          inputs.removeAttr('disabled');
        };

        inputs.attr('disabled', 'disabled');

        _this.on('moving.next', enable);

        _this.on('validation', function (err) {
          if (err) {
            enable();
          }
        });
      };

      _this.show = function (direction) {
        return new Promise(function (resolve) {
          if (dom.hasClass('active')) {
            _this.emit('shown');

            resolve();
          }

          _this.emit('showing');

          if (direction) {
            dom.addClass('showing-' + direction);
          } else {
            dom.addClass('showing');
          }

          setTimeout(function () {
            if (direction) {
              dom.removeClass('showing-' + direction);
            } else {
              dom.removeClass('showing');
            }

            _this.emit('shown');

            resolve();
          }, 333);
        });
      };

      _this.hide = function (direction) {
        return new Promise(function (resolve) {
          _this.emit('hiding');

          if (direction) {
            dom.addClass('hiding-' + direction);
          } else {
            dom.addClass('hiding');
          }

          setTimeout(function () {
            if (direction) {
              dom.removeClass('hiding-' + direction);
            } else {
              dom.removeClass('hiding');
            }

            _this.emit('hidden');

            resolve();
          }, 333);
        });
      };

      _this.on('showing', function () {
        dom.addClass('active');
        dom.trigger('wizard.showing');
      });

      _this.on('hidden', function () {
        dom.removeClass('active');
        dom.trigger('wizard.hidden');
      });

      _this.on('shown', function () {
        dom.find(':input').first().focus();
        dom.trigger('wizard.shown');
      });

      _this.on('validation', function (err) {
        if (typeof err === 'undefined') {
          dom.find(':input.is-invalid').removeClass('is-invalid');
          dom.find('.invalid-feedback').remove();
          return;
        }

        var field = window.$(err.field);
        var group = field.closest('.form-group');
        var feedback = group.find('.invalid-feedback');
        field.addClass('is-invalid');

        if (!feedback.length) {
          feedback = window.$('<div>').addClass('invalid-feedback');
          feedback.appendTo(group);
        }

        feedback.text(err.message);
        field.focus();
      });

      _this.prev = function () {
        _this.hide('rw').then(function () {
          _this.emit('moving.prev');

          _this.emit('prev');
        });
      };

      _this.next = function () {
        submit();

        _this.emit('validation');

        _this.validate().then(function () {
          _this.emit('moving.next');

          _this.hide('ff').then(function () {
            _this.emit('next');
          });
        }).catch(function (err) {
          _this.emit('validation', err);
        });
      };

      _this.validate = function () {
        return new Promise(function (resolve, reject) {
          var rejected = false;
          var waitingValidators = [];
          var form = dom.closest('form');
          dom.find(':input').each(function () {
            if (rejected) {
              return false;
            }

            var input = window.$(this);
            var value = input.val();
            var required = input.attr('required');
            var type = input.attr('type') || 'text';
            var unique = input.attr('data-unique');
            var serverSide = input.attr('data-validator');
            var pairWith = input.attr('data-pair');

            if (required && !value.trim()) {
              rejected = true;
              reject({
                field: input,
                message: 'This field is required.'
              });
              return false;
            }

            switch (type) {
              case 'email':
                waitingValidators.push([new EmailValidator(), input]);
                break;
            }

            if (unique) {
              waitingValidators.push([new UniqueValidator(unique), input]);
            }

            if (serverSide) {
              waitingValidators.push([new ServerValidator(serverSide), input]);
            }

            if (pairWith) {
              waitingValidators.push([new PairlValidator(form.find(":input[name=\"".concat(pairWith, "\"]")).val()), input]);
            }
          });

          var validateNext = function validateNext() {
            var pair = waitingValidators.shift();
            var validator = pair[0];
            var input = pair[1];
            var value = input.val().trim();
            validator.check(value).then(function () {
              if (waitingValidators.length) {
                validateNext();
              } else if (!rejected) {
                resolve();
              }
            }).catch(function (err) {
              if (!rejected) {
                rejected = true;
                reject({
                  field: input,
                  message: err.message
                });
              }
            });
          };

          if (!waitingValidators.length) {
            if (!rejected) {
              resolve();
            }
          } else {
            validateNext();
          }
        });
      };

      var self = _assertThisInitialized(_this);

      dom.on('click', '[data-action="prev"]', function () {
        self.prev();
      });
      dom.on('click', '[data-skip]', function () {
        var index = parseInt(window.$(this).data('skip'));
        self.hide('ff');
        self.emit('skip', index);
      });
      dom.on('click', '[data-action="next"]', function () {
        self.next();
      });
      dom.on('keydown', ':input', function (e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          self.next();
        }
      });
      return _this;
    }

    return WizardStep;
  }(EventEmitter);

  var Wizard =
  /*#__PURE__*/
  function (_EventEmitter2) {
    _inherits(Wizard, _EventEmitter2);

    function Wizard(dom) {
      var _this2;

      _classCallCheck(this, Wizard);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Wizard).call(this));

      var self = _assertThisInitialized(_this2);

      var steps = [];
      dom.find('.step').each(function () {
        var subdom = window.$(this);
        var step = new WizardStep(self, subdom);
        subdom.data('wizard-step', step);
        steps.push(step);
      });
      steps.forEach(function (step, i) {
        if (i > 0) {
          step.on('moving.prev', function () {
            var prev = steps[i - 1];
            prev.show('rw');
          });
        }

        if (i < steps.length - 1) {
          step.on('moving.next', function () {
            var next = steps[i + 1];
            next.show('ff');
          });
        } else {
          step.on('next', function () {
            _this2.submit();
          });
        }

        step.on('skip', function (index) {
          steps[index].show('ff');
        });
      });

      _this2.show = function (stepIndex) {
        if (typeof stepIndex === 'undefined') {
          stepIndex = 0;
        }

        dom.find('.step').each(function (index) {
          var subdom = window.$(this);
          var isInvalid = subdom.find('.form-group.is-invalid').length;

          if (isInvalid) {
            stepIndex = index;
            return false;
          }
        });
        steps[stepIndex].show();
      };

      _this2.submit = function () {
        var form = dom.closest('form');
        form.submit();
      };

      return _this2;
    }

    return Wizard;
  }(EventEmitter);

  var WizardPlugin =
  /*#__PURE__*/
  function (_PluginBase) {
    _inherits(WizardPlugin, _PluginBase);

    function WizardPlugin() {
      _classCallCheck(this, WizardPlugin);

      return _possibleConstructorReturn(this, _getPrototypeOf(WizardPlugin).apply(this, arguments));
    }

    _createClass(WizardPlugin, [{
      key: "ready",
      value: function ready() {
        var $ = this.$;
        $('.wizard').each(function () {
          var wizard = new Wizard($(this));
          wizard.show();
        });
      }
    }]);

    return WizardPlugin;
  }(PluginBase);

  var Dropzone =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Dropzone, _EventEmitter);

    function Dropzone(dom) {
      var _this;

      _classCallCheck(this, Dropzone);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Dropzone).call(this));
      var input = dom.find('input[type="file"]');
      var mimeType = input.attr('accept');

      var self = _assertThisInitialized(_this);

      var check = function check(file) {
        if (mimeType) {
          var typeEx = new RegExp('^' + mimeType.replace('/', '\\/').replace('*', '.*'));
          var match = file.type.match(typeEx);

          if (!match) {
            return false;
          }
        }

        return true;
      };

      dom.on('dragenter', function (e) {
        e.preventDefault();
        dom.addClass('active');

        _this.emit('drag.enter');
      }).on('dragleave', function (e) {
        e.preventDefault();
        dom.removeClass('active');

        _this.emit('drag.exit');
      }).on('dragover', function (e) {
        e.preventDefault();
        dom.addClass('active');

        _this.emit('drag.over');
      }).on('drop', function (e) {
        e.preventDefault();

        if (e.originalEvent.dataTransfer.files.length !== 1) {
          return;
        }

        var i = 0;

        for (i = 0; i < e.originalEvent.dataTransfer.files.length; i++) {
          if (!check(e.originalEvent.dataTransfer.files[i])) {
            _this.emit('error', new Error('The dragged file was not of the correct type.'));

            return;
          }
        }

        if (e.originalEvent.dataTransfer.files) {
          input.get(0).files = e.originalEvent.dataTransfer.files;
          input.trigger('change');
        }
      }).on('click', function (e) {
        if (e.target === input.get(0)) {
          return;
        }

        e.preventDefault();
        input.get(0).click();
      });
      input.on('change', function () {
        var i = 0;

        for (i = 0; i < this.files.length; i++) {
          self.emit('file', this.files[i]);
        }
      });
      return _this;
    }

    return Dropzone;
  }(EventEmitter);

  var ImageDropzone =
  /*#__PURE__*/
  function (_Dropzone) {
    _inherits(ImageDropzone, _Dropzone);

    function ImageDropzone(dom) {
      var _this2;

      _classCallCheck(this, ImageDropzone);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(ImageDropzone).call(this, dom));

      _this2.on('error', function () {
        alert('Only images are supported here.');
      });

      _this2.on('file', function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
          dom.css('background-image', "url(".concat(e.target.result, ")"));
        };

        reader.readAsDataURL(file);
      });

      return _this2;
    }

    return ImageDropzone;
  }(Dropzone);

  var DropzonePlugin =
  /*#__PURE__*/
  function (_PluginBase) {
    _inherits(DropzonePlugin, _PluginBase);

    function DropzonePlugin() {
      _classCallCheck(this, DropzonePlugin);

      return _possibleConstructorReturn(this, _getPrototypeOf(DropzonePlugin).apply(this, arguments));
    }

    _createClass(DropzonePlugin, [{
      key: "ready",
      value: function ready() {
        var $ = this.$;
        $('.dropzone').each(function () {
          var dom = $(this);

          if (dom.hasClass('dropzone-image')) {
            new ImageDropzone(dom);
          } else {
            new Dropzone(dom);
          }
        });
      }
    }]);

    return DropzonePlugin;
  }(PluginBase);

  var Debouncer = function Debouncer(func, tolerance) {
    if (typeof tolerance === 'undefined') {
      tolerance = 333;
    }

    var timer = null;
    var bouncedArgs = [];

    var unbounced = function unbounced() {
      {
        func.apply(func, bouncedArgs);
        timer = null;
      }
    };

    var runner = function runner() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      bouncedArgs = args;

      if (timer === null) {
        timer = setTimeout(unbounced, tolerance);
      }
    };

    return runner;
  };

  var ListItem =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(ListItem, _EventEmitter);

    function ListItem(data) {
      var _this;

      _classCallCheck(this, ListItem);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ListItem).call(this));
      _this.data = data;

      _this.attach = function (dom) {
        var container = window.$('<a>').addClass('typeahead-item').addClass('list-group-item').attr('href', 'javascript:;');

        if (data.thumbnail) {
          var thumbContainer = window.$('<div>').addClass('d-flex w-100');
          var thumbImg = window.$('<img>').attr('src', data.thumbnail).attr('height', '30').addClass('mr-3');
          var span = window.$('<span>').text(data.label);
          thumbImg.appendTo(thumbContainer);
          span.appendTo(thumbContainer);
          thumbContainer.appendTo(container);
        } else {
          container.text(data.label);
        }

        container.on('click', function () {
          _this.select();
        });
        container.appendTo(dom);

        _this.focus = function () {
          container.addClass('active').addClass('list-item-active');

          _this.emit('focused');
        };

        _this.blur = function () {
          container.removeClass('active').removeClass('list-item-active');

          _this.emit('blurred');
        };

        _this.select = function () {
          container.addClass('active').addClass('list-item-active');

          _this.emit('selected');
        };
      };

      _this.focus = function () {
        throw new Error('List item not attached to container DOM element.');
      };

      _this.blur = function () {
        throw new Error('List item not attached to container DOM element.');
      };

      return _this;
    }

    return ListItem;
  }(EventEmitter);

  var List =
  /*#__PURE__*/
  function (_EventEmitter2) {
    _inherits(List, _EventEmitter2);

    function List(data) {
      var _this2;

      _classCallCheck(this, List);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(List).call(this));

      _this2.attach = function (dom) {
        var container = window.$('<div>').addClass('typeahead-container').addClass('list-group');
        var position = dom.offset();
        var selectedItem = null;
        var items = [];
        data.forEach(function (item, index) {
          var listItem = new ListItem(item);
          listItem.index = index;
          listItem.on('focused', function () {
            if (selectedItem !== listItem) {
              if (selectedItem !== null) {
                selectedItem.blur();
              }

              selectedItem = listItem;
            }
          });
          listItem.on('selected', function () {
            _this2.emit('selected', listItem);
          });
          items.push(listItem);
          listItem.attach(container);
        });
        container.css({
          position: 'absolute',
          top: position.top + dom.outerHeight(true),
          left: position.left,
          width: dom.outerWidth(true)
        });
        window.$('body').append(container);

        _this2.detatch = function () {
          container.remove();
        };

        _this2.moveUp = function () {
          var index = null;

          if (selectedItem !== null) {
            index = selectedItem.index;
          }

          if (index === null) {
            index = data.length - 1;
          } else {
            index = Math.max(0, index - 1);
          }

          _this2.focus(index);
        };

        _this2.moveDown = function () {
          var index = null;

          if (selectedItem !== null) {
            index = selectedItem.index;
          }

          if (index === null) {
            index = 0;
          } else {
            index = Math.min(data.length - 1, index + 1);
          }

          _this2.focus(index);
        };

        _this2.focus = function (index) {
          if (typeof index === 'undefined') {
            throw new Error('Expected index of item to select.');
          }

          if (typeof items[index] !== 'undefined') {
            items[index].focus();
          } else {
            if (selectedItem !== null) {
              selectedItem.blur();
            }

            selectedItem = null;
          }
        };

        _this2.select = function () {
          if (selectedItem !== null) {
            selectedItem.select();
          }
        };
      };

      _this2.detatch = function () {
        throw new Error('List has not been attached to a DOM element.');
      };

      return _this2;
    }

    return List;
  }(EventEmitter);

  var Typeahead =
  /*#__PURE__*/
  function (_EventEmitter3) {
    _inherits(Typeahead, _EventEmitter3);

    function Typeahead(input, urlTemplate, dataTransformer) {
      var _this3;

      _classCallCheck(this, Typeahead);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Typeahead).call(this));
      var name = input.attr('name');
      var replacement = window.$('<input>').attr('name', name).attr('type', 'hidden');
      input.removeAttr('name');
      input.after(replacement);
      var search = new Debouncer(function (value) {
        var url = urlTemplate.replace('%s', encodeURIComponent(value));
        window.$.getJSON(url, function (data) {
          var transformed = dataTransformer(data);
          var list = new List(transformed);

          if (input.data('typeahed-list')) {
            input.data('typeahed-list').detatch();
          }

          _this3.on('move.up', function () {
            list.moveUp();
          });

          _this3.on('move.down', function () {
            list.moveDown();
          });

          _this3.on('select', function () {
            list.select();
          });

          list.on('selected', function (item) {
            replacement.val(item.data.id);
            input.val(item.data.label);
            list.detatch();
            input.focus();
          });
          list.attach(input);
          input.data('typeahed-list', list);
        });
      }, 900);
      input.on('input', function () {
        return search(input.val());
      });
      input.on('keydown', function (e) {
        switch (e.keyCode) {
          case 40:
            e.preventDefault();

            _this3.emit('move.down');

            break;

          case 38:
            e.preventDefault();

            _this3.emit('move.up');

            break;

          case 13:
            if (!replacement.val()) {
              e.preventDefault();
              e.stopPropagation();

              _this3.emit('select');
            }

            break;
        }
      });
      return _this3;
    }

    return Typeahead;
  }(EventEmitter);

  var Mapper = function Mapper(template) {
    var dollar = template.indexOf('.$.');
    var left = template.substr(0, dollar);
    var right = template.substr(dollar + 3);
    return function (index, value) {
      var array = value[left];
      var item = array[index];

      if (typeof item === 'undefined') {
        throw new Error('Index out of range.');
      }

      return item[right];
    };
  };

  var Counter = function Counter(template) {
    var dollar = template.indexOf('.$.');
    var left = template.substr(0, dollar);
    return function (value) {
      var obj = value[left];

      if (Array.isArray(obj)) {
        return obj.length;
      }

      throw new Error('Value is not an array.');
    };
  };

  var Transformer = function Transformer(template) {
    _classCallCheck(this, Transformer);

    this.transform = function (data) {
      var idTemplate = template.id;
      var labelTemplate = template.label;
      var thumbnailTemplate = template.thumbnail;
      var idMapper = idTemplate ? new Mapper(idTemplate) : null;
      var labelMapper = labelTemplate ? new Mapper(labelTemplate) : null;
      var thumbnailMapper = thumbnailTemplate ? new Mapper(thumbnailTemplate) : null;
      var counter = new Counter(idTemplate);
      var count = 0;

      if (!idMapper) {
        throw new Error('No template provided for returning an object ID.');
      }

      if (!labelMapper) {
        throw new Error('No template provided for returning an object label.');
      }

      try {
        count = counter(data);
      } catch (err) {
        throw new Error('Invalid data returned.');
      }

      var i = 0;
      var transformed = [];

      var map = function map(index) {
        var obj = {};
        obj.id = idMapper(index, data);
        obj.label = labelMapper(index, data);

        if (thumbnailMapper) {
          obj.thumbnail = thumbnailMapper(index, data);
        }

        return obj;
      };

      for (i = 0; i < count; i++) {
        transformed.push(map(i));
      }

      return transformed;
    };
  };

  var TypeaheadPlugin =
  /*#__PURE__*/
  function (_PluginBase) {
    _inherits(TypeaheadPlugin, _PluginBase);

    function TypeaheadPlugin() {
      _classCallCheck(this, TypeaheadPlugin);

      return _possibleConstructorReturn(this, _getPrototypeOf(TypeaheadPlugin).apply(this, arguments));
    }

    _createClass(TypeaheadPlugin, [{
      key: "ready",
      value: function ready() {
        var $ = this.$;
        $('input[data-typeahead-url]').each(function () {
          var input = $(this);
          var url = input.data('typeahead-url');
          var transformer = new Transformer(input.data('typeahead-transform'));
          var ta = new Typeahead(input, url, transformer.transform);
          input.removeAttr('data-typeahead-url');
          input.removeAttr('data-typeahead-transform');
          input.data('typeahead', ta);
        });
      }
    }]);

    return TypeaheadPlugin;
  }(PluginBase);

  var ViewBase =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(ViewBase, _EventEmitter);

    _createClass(ViewBase, [{
      key: "classNames",
      value: function classNames() {
        return [];
      }
    }]);

    function ViewBase(app) {
      var _this;

      _classCallCheck(this, ViewBase);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ViewBase).call(this));
      _this.app = app;
      return _this;
    }

    _createClass(ViewBase, [{
      key: "ready",
      value: function ready() {}
    }]);

    return ViewBase;
  }(EventEmitter);

  var CreateProjectView =
  /*#__PURE__*/
  function (_ViewBase) {
    _inherits(CreateProjectView, _ViewBase);

    function CreateProjectView() {
      _classCallCheck(this, CreateProjectView);

      return _possibleConstructorReturn(this, _getPrototypeOf(CreateProjectView).apply(this, arguments));
    }

    _createClass(CreateProjectView, [{
      key: "classNames",
      value: function classNames() {
        return ['projects', 'create-project'];
      }
    }, {
      key: "ready",
      value: function ready() {
        var $ = this.app.$;
        var nameField = $('input[name="name"]');
        var appleField = $('#id_apple_podcasts_id');
        var appleStep = appleField.closest('.step');
        appleStep.on('wizard.shown', function () {
          if (appleField.val()) {
            appleField.trigger('input');
          }
        });
        nameField.on('change', function () {
          appleField.val(nameField.val());
        });
      }
    }]);

    return CreateProjectView;
  }(ViewBase);

  var Database =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Database, _EventEmitter);

    function Database(uri, reconnectTime) {
      var _this;

      _classCallCheck(this, Database);

      var socket = null;
      var reconnectTimeout = null;
      var connected = false;
      _this = _possibleConstructorReturn(this, _getPrototypeOf(Database).call(this));

      _this.connect = function () {
        socket = new WebSocket(uri);

        var method = function method(name, data, meta) {
          var unserialised = {
            meta: window.$.extend({
              method: name
            }, meta),
            data: data
          };
          var json = JSON.stringify(unserialised);
          socket.send(json);
        };

        _this.create = function (data) {
          return method('create', data);
        };

        _this.update = function (data) {
          return method('update', data);
        };

        _this.update_list = function (type, data) {
          return method('update_list', data, {
            type: type
          });
        };

        _this.delete = function (data) {
          return method('delete', data);
        };

        _this.list = function (data) {
          return method('list', data);
        };

        _this.get = function (data) {
          return method('get', data);
        };

        socket.onclose = function () {
          socket = null;
          reset();

          if (connected) {
            connected = false;

            _this.emit('disconnected');
          }

          reconnectTimeout = setTimeout(function () {
            reconnectTime *= 2;

            _this.connect();
          }, reconnectTime);
          console.warn("Waiting ".concat(reconnectTime / 1000, " second(s) for connection to be restored."));
        };

        socket.onmessage = function (e) {
          var unserialised = JSON.parse(e.data);

          if (unserialised.error) {
            console.warn(unserialised.error);
            return;
          }

          if (!unserialised.meta) {
            console.warn('Missing response metadata.');
            return;
          }

          switch (unserialised.meta.method) {
            case 'get':
              _this.emit('got', unserialised.meta.type, unserialised.data);

              return;

            case 'list':
              _this.emit('listed', unserialised.meta.type, unserialised.data);

              return;

            case 'create':
              _this.emit('created', unserialised.meta.type, unserialised.data);

              return;

            case 'update':
              _this.emit('updated', unserialised.meta.type, unserialised.data);

              return;

            case 'update_list':
              _this.emit('listed', unserialised.meta.type, unserialised.data);

              return;

            case 'delete':
              _this.emit('deleted', unserialised.meta.type, unserialised.data);

              return;
          }

          console.warn('Unrecognised response.', unserialised.meta);
        };

        socket.onopen = function () {
          if (reconnectTimeout !== null) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
          }

          if (!connected) {
            connected = true;

            _this.emit('connected');
          }
        };
      };

      var reset = function reset() {
        if (typeof reconnectTime === 'undefined') {
          reconnectTime = 1000;
        }

        _this.create = function () {
          throw new Error('Database not connected.');
        };

        _this.update = function () {
          throw new Error('Database not connected.');
        };

        _this.update_list = function () {
          throw new Error('Database not connected.');
        };

        _this.delete = function () {
          throw new Error('Database not connected.');
        };

        _this.list = function () {
          throw new Error('Database not connected.');
        };

        _this.send = function () {
          throw new Error('Database not connected.');
        };
      };

      reset();
      return _this;
    }

    return Database;
  }(EventEmitter);

  var CardCreationRequest =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(CardCreationRequest, _EventEmitter);

    function CardCreationRequest() {
      var _this;

      _classCallCheck(this, CardCreationRequest);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CardCreationRequest).call(this));
      _this.accepted = false;
      _this.rejected = false;
      _this.cancelled = false;
      var timer = setTimeout(function () {
        _this.cancel();
      }, 10000);

      _this.on('accepted', function () {
        clearTimeout(timer);
      });

      _this.on('rejected', function () {
        clearTimeout(timer);
      });

      return _this;
    }

    _createClass(CardCreationRequest, [{
      key: "accept",
      value: function accept(info) {
        if (!this.accepted && !this.rejected && !this.cancelled) {
          this.accepted = true;
          this.emit('accepted', info);
        } else {
          throw new Error('Request is in an invalid state.');
        }
      }
    }, {
      key: "reject",
      value: function reject() {
        if (!this.accepted && !this.rejected && !this.cancelled) {
          this.rejected = true;
          this.emit('rejected');
        } else {
          throw new Error('Request is in an invalid state.');
        }
      }
    }, {
      key: "cancel",
      value: function cancel() {
        if (!this.accepted && !this.rejected && !this.cancelled) {
          this.cancelled = true;
          this.emit('cancelled');
        } else {
          throw new Error('Request is in an invalid state.');
        }
      }
    }]);

    return CardCreationRequest;
  }(EventEmitter);

  var $ = window.$;

  var CardBase =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(CardBase, _EventEmitter);

    function CardBase() {
      var _this;

      _classCallCheck(this, CardBase);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CardBase).call(this));
      _this.actions = {};

      _this.attach = function (dom) {
        var container = $('<div>').addClass('kanban-card card mb-3');
        var body = $('<div>').addClass('card-body');
        container.append(body);
        dom.append(container);

        _this.populate(body);

        if (Object.keys(_this.actions).length) {
          var footer = $('<div>').addClass('card-footer text-right');
          Object.keys(_this.actions).forEach(function (key) {
            var action = _this.actions[key];
            var a = $('<a>').attr('href', 'javascript:;');
            var icon = $('<i>').addClass("fa fa-".concat(action.icon || key));
            a.on('click', function (e) {
              e.preventDefault();
              action.perform().catch(function (err) {
                console.warn('Error performing', key, err);
              });
            });
            a.addClass('text-muted');
            a.append(icon);
            footer.append(a);
          });
          container.append(footer);
        }

        _this.detatch = function () {
          container.remove();

          _this.detatch = function () {
            throw new Error('Card has not been attached to a DOM element.');
          };

          _this.freeze = function () {
            throw new Error('Card has not been attached to a DOM element.');
          };

          _this.unfreeze = function () {
            throw new Error('Card has not been attached to a DOM element.');
          };

          _this.emit('detatched');
        };

        _this.freeze = function () {
          container.addClass('kanban-frozen');
        };

        _this.unfreeze = function () {
          container.removeClass('kanban-frozen');
        };

        _this.emit('attached');

        return container;
      };

      _this.populate = function () {};

      _this.cancel = function () {
        _this.emit('cancelled');
      };

      _this.submit = function (value) {
        _this.emit('submitted', value);
      };

      _this.detatch = function () {
        throw new Error('Card has not been attached to a DOM element.');
      };

      _this.freeze = function () {
        throw new Error('Card has not been attached to a DOM element.');
      };

      _this.unfreeze = function () {
        throw new Error('Card has not been attached to a DOM element.');
      };

      return _this;
    }

    return CardBase;
  }(EventEmitter);

  var TemporaryCard =
  /*#__PURE__*/
  function (_CardBase) {
    _inherits(TemporaryCard, _CardBase);

    function TemporaryCard(settings) {
      var _this2;

      _classCallCheck(this, TemporaryCard);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(TemporaryCard).call(this, settings));

      _this2.populate = function (body) {
        var input = $('<input>').attr('type', 'text').addClass('form-control');

        if (settings.placeholder) {
          input.attr('placeholder', settings.placeholder);
        }

        input.on('keyup', function (e) {
          switch (e.keyCode) {
            case 27:
              _this2.cancel();

              break;

            case 13:
              e.preventDefault();

              _this2.submit(input.val());

              break;
          }
        });
        body.append(input);
        input.focus();
      };

      return _this2;
    }

    return TemporaryCard;
  }(CardBase);
  var Card =
  /*#__PURE__*/
  function (_CardBase2) {
    _inherits(Card, _CardBase2);

    function Card(settings) {
      var _this3;

      _classCallCheck(this, Card);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Card).call(this, settings));
      _this3.id = settings.id;
      _this3.ordering = settings.ordering;
      _this3.actions = {
        delete: {
          icon: 'trash',
          title: 'Delete card',
          perform: function perform() {
            return new Promise(function (resolve, reject) {
              if (confirm('Are you sure?')) {
                _this3.destroy().then(function () {
                  resolve(true);
                }).catch(function (err) {
                  reject(err);
                });
              } else {
                resolve(false);
              }
            });
          }
        }
      };

      _this3.populate = function (body) {
        var title = $('<a>').attr('href', settings.url).text(settings.name);
        body.append(title);
      };

      _this3.destroy = function () {
        return new Promise(function (resolve) {
          _this3.emit('destroy', resolve);
        });
      };

      _this3.move = function (from, to) {
        _this3.freeze();

        _this3.emit('send', from, to);
      };

      _this3.update = function (newSettings) {
        settings = newSettings;
        _this3.ordering = newSettings.ordering;
        _this3.name = newSettings.name;
      };

      return _this3;
    }

    return Card;
  }(CardBase);

  var $$1 = window.$;

  var Icon = function Icon(type) {
    _classCallCheck(this, Icon);

    this.attach = function (dom) {
      var colours = {
        info: '#17a2b8',
        warning: '#ffc107',
        danger: '#dc3545',
        success: '#28a745'
      };
      var colour = colours[type];

      if (typeof colour === 'undefined') {
        colour = colours.info;
      }

      var html = '<svg class="rounded mr-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"><rect width="100%" height="100%" fill="' + colour + '"></rect></svg>';
      dom.append(html);
    };
  };

  var Toast =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Toast, _EventEmitter);

    function Toast(_ref) {
      var _this;

      var type = _ref.type,
          sender = _ref.sender,
          text = _ref.text;

      _classCallCheck(this, Toast);

      if (typeof type === 'undefined') {
        type = 'info';
      }

      if (typeof sender === 'undefined') {
        sender = 'Pico';
      }

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Toast).call(this));
      _this.type = type;
      _this.sender = sender;
      _this.text = text;

      _this.show = function () {
        var container = $$1('<div>').addClass('toast').attr('role', 'alert').attr('ria-live', 'assertive').attr('aria-atomic', 'true').css({
          'position': 'fixed',
          'bottom': '15px',
          'left': '15px',
          'min-width': '300px'
        });
        var header = $$1('<div>').addClass('toast-header');
        var icon = new Icon(_this.type);
        var title = $$1('<strong>').addClass('mr-auto').text(_this.sender);
        var time = $$1('<small>').text('Just now');
        var btn = $$1('<butotn>').addClass('ml-2 mb-1 close').attr('data-dismiss', 'toast').attr('aria-label', 'Close').html('<span aria-hidden="true">&times;</span>').attr('href', 'javascript:;');
        icon.attach(header);
        header.append(title);
        header.append(time);
        header.append(btn);
        container.append(header);
        var body = $$1('<div>').addClass('toast-body');
        body.text(text);
        container.append(body);
        $$1('body').append(container);
        container.toast({
          delay: 6000
        }).toast('show');
      };

      return _this;
    }

    return Toast;
  }(EventEmitter);

  var toast = function toast(text) {
    return new Toast({
      type: 'info',
      text: text
    }).show();
  };

  toast.info = function (text) {
    return new Toast({
      type: 'info',
      text: text
    }).show();
  };

  toast.warning = function (text) {
    return new Toast({
      type: 'warning',
      text: text
    }).show();
  };

  toast.error = function (text) {
    return new Toast({
      type: 'danger',
      text: text
    }).show();
  };

  toast.success = function (text) {
    return new Toast({
      type: 'success',
      text: text
    }).show();
  };

  var $$2 = window.$;
  var Column =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Column, _EventEmitter);

    function Column(dom, settings) {
      var _this;

      _classCallCheck(this, Column);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Column).call(this));
      _this.id = settings.id;
      _this.name = settings.name;

      _this.on('attached', function () {
        dom.trigger('kanban.attached');
      });

      _this.on('cards.create.request', function () {
        dom.trigger('kanban.cards.create.request');
      });

      var heading = $$2('<h6>').text(settings.name);
      var container = $$2('<div>').addClass('kanban-list-container');
      var footer = $$2('<div>').addClass('kanban-list-footer');

      if (settings.can_create_cards) {
        var addBtn = $$2('<button>').addClass('btn btn-outline-primary btn-block mb-3').text('Add card');
        addBtn.on('click', function (e) {
          e.preventDefault();

          if (addBtn.attr('disabled')) {
            return;
          }

          if (settings.can_create_cards) {
            var request = new CardCreationRequest(_assertThisInitialized(_this));
            request.on('accepted', function (subsettings) {
              var card = new TemporaryCard(subsettings);
              card.on('submitted', function (value) {
                card.detatch();

                _this.emit('cards.create.submit', {
                  name: value
                });
              }).on('cancelled', function () {
                card.detatch();
              }).on('attached', function () {
                dom.trigger('readjust');
              }).on('detatched', function () {
                addBtn.removeAttr('disabled');
                dom.trigger('readjust');
              });
              card.attach(container);
            }).on('rejected', function (reason) {
              console.warn('Request rejected.', reason);
              addBtn.removeAttr('disabled');
            }).on('cancelled', function () {
              console.warn('Request was not fulfilled in time.');
              addBtn.removeAttr('disabled');
            });
            addBtn.attr('disabled', 'disabled');

            _this.emit('cards.create.request', request);
          }
        });
        footer.append(addBtn);
      }

      dom.append(heading);
      dom.append(container);
      dom.append(footer);

      _this.canSend = function () {
        return settings.can_move_out;
      };

      _this.canReceive = function () {
        return settings.can_move_in;
      };

      _this.addCard = function (card) {
        var subdom = card.attach(container);
        subdom.data('kanban-card', card);
      };

      _this.reorder = function (order) {
        _this.emit('cards.reorder', order);
      };

      _this.redraw = function () {
        var orderings = {};
        var cardsByOrdering = {};
        container.find('.kanban-card').each(function () {
          var subdom = $$2(this);
          var card = subdom.data('kanban-card');
          orderings[card.ordering] = subdom;
          cardsByOrdering[card.ordering] = card;
          subdom.remove();
        });
        var keys = Object.keys(orderings);
        keys.sort();
        keys.forEach(function (ordering) {
          var subdom = orderings[ordering];
          var card = cardsByOrdering[ordering];
          subdom.data('kanban-card', card);
          container.append(subdom);
          card.unfreeze();
        });
      };

      return _this;
    }

    return Column;
  }(EventEmitter);
  var Board =
  /*#__PURE__*/
  function (_EventEmitter2) {
    _inherits(Board, _EventEmitter2);

    function Board(dom, id) {
      var _this2;

      _classCallCheck(this, Board);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Board).call(this));
      var columns = $$2('<div>').addClass('kanban-column-row');
      var columnsByID = {};
      var cardsByID = {};
      var ready = false;

      _this2.on('freeze', function () {
        console.debug('Board frozen.');
        dom.find('a[href], button').each(function () {
          var subdom = $$2(this);

          if (subdom.data('frozen')) {
            return;
          }

          if (subdom.attr('disabled')) {
            return;
          }

          subdom.attr('disabled', 'disabled');
          subdom.data('frozen', true);
        });
        dom.addClass('kanban-frozen');
      }).on('unfreeze', function () {
        console.debug('Board unfrozen.');
        dom.find('a[href], button').each(function () {
          var subdom = $$2(this);

          if (!subdom.data('frozen')) {
            return;
          }

          subdom.removeAttr('disabled');
          subdom.data('frozen', false);
        });
        dom.removeClass('kanban-frozen');
      });

      dom.append(columns);

      _this2.emit('freeze');

      var loadColumns = function loadColumns(data) {
        ready = false;
        columns.html('').css({
          width: 0
        });
        data.forEach(function (settings) {
          var subdom = $$2('<div>').addClass('kanban-column');
          var column = new Column(subdom, $$2.extend({
            id: settings.id
          }, settings.attributes));
          subdom.on('readjust', readjust);
          column.on('cards.create.request', function (request) {
            _this2.emit('cards.create.request', request, column);
          }).on('cards.create.submit', function (data) {
            db.create({
              type: 'cards',
              attributes: $$2.extend({
                column: settings.id
              }, data)
            });
          }).on('cards.reorder', function (ids) {
            var reorderings = [];
            ids.forEach(function (id, ordering) {
              reorderings.push({
                type: 'cards',
                id: id,
                attributes: {
                  ordering: ordering
                }
              });
            });
            db.update_list('cards', reorderings);
          });
          columnsByID[settings.id] = column;
          settings.cards.forEach(createCard);
          subdom.data('kanban-column', column);
          columns.append(subdom);
          column.emit('attached');
          var width = subdom.outerWidth(true);
          columns.width(columns.width() + width + 15);
        });
        columns.find('.kanban-column').on('drop', function (e, ui) {
          var card = ui.draggable.data('kanban-card');
          var sender = ui.draggable.closest('.kanban-column');
          var from = sender.data('kanban-column');
          var receiver = $$2(this);
          var to = receiver.data('kanban-column');

          if (card === null || typeof card === 'undefined') {
            console.warning('Lost the card object.');
            return false;
          }

          if (!from.canSend(card)) {
            receiver.removeClass('kanban-can-receive').removeClass('kanban-cannot-receive');
            toast.warning('Cards can\'t be moved from this column.');
            return false;
          }

          if (!to.canReceive(card)) {
            toast.warning('Cards can\'t be moved to this column.');
            receiver.removeClass('kanban-can-receive').removeClass('kanban-cannot-receive');
            return false;
          }

          receiver.removeClass('kanban-can-receive').removeClass('kanban-cannot-receive');
          card.move(from, to);
        }).on('dropover', function (e, ui) {
          var draggable = ui.draggable;
          var card = draggable.data('kanban-card');
          var sender = draggable.closest('.kanban-column');
          var from = sender.data('kanban-column');
          var receiver = $$2(this);
          var to = receiver.data('kanban-column');

          if (sender.is(receiver)) {
            return false;
          }

          if (!from.canSend(card)) {
            receiver.removeClass('kanban-can-receive').addClass('kanban-cannot-receive');
            return false;
          }

          if (!to.canReceive(card)) {
            receiver.removeClass('kanban-can-receive').addClass('kanban-cannot-receive');
            return false;
          }

          receiver.addClass('kanban-can-receive').removeClass('kanban-cannot-receive');
        }).on('dropout', function () {
          var receiver = $$2(this);
          receiver.removeClass('kanban-can-receive').removeClass('kanban-cannot-receive');
        }).droppable();
        columns.find('.kanban-list-container').on('sortstart', function (e, ui) {
          ui.placeholder.height(ui.item.height());
        }).on('sortupdate', function () {
          var column = $$2(this).closest('.kanban-column').data('kanban-column');
          var orderings = [];
          $$2(this).find('.kanban-card').each(function () {
            var card = $$2(this).data('kanban-card');
            card.freeze();
            orderings.push(card.id);
          });
          column.reorder(orderings);
        }).sortable({
          placeholder: 'ui-sortable-placeholder mb-3'
        });

        _this2.emit('unfreeze');

        ready = true;
        readjust();
      };

      var readjust = function readjust() {
        var maxHeight = 0;

        if (!ready) {
          return;
        }

        columns.find('.kanban-column').each(function () {
          var column = $$2(this);
          var height = column.outerHeight(true);
          maxHeight = Math.max(maxHeight, height);
        });
        dom.height(maxHeight);
      };

      var createCard = function createCard(settings) {
        var columnID = settings.attributes.column;
        var column = columnsByID[columnID];

        if (column) {
          var attrs = $$2.extend({
            id: settings.id,
            url: settings.links.detail
          }, settings.attributes);
          var card = new Card(attrs);
          card.on('attached', readjust).on('detatched', readjust).on('send', function (sender, receiver) {
            card.freeze();
            db.update({
              type: 'cards',
              id: card.id,
              attributes: {
                column: receiver.id
              }
            });
          }).on('destroy', function (callback) {
            console.debug('Destroying card.', settings.id);
            db.delete({
              type: 'cards',
              id: settings.id
            });
            callback();
          });
          column.addCard(card);
          cardsByID[settings.id] = card;
        } else {
          console.warn('Could not add card to column', columnID);
        }
      };

      var updateCard = function updateCard(settings) {
        var card = cardsByID[settings.id];

        if (typeof card !== 'undefined') {
          var column = columnsByID[settings.attributes.column];
          var attrs = $$2.extend({
            id: settings.id,
            url: settings.links.detail
          }, settings.attributes);
          card.update(attrs);
          card.detatch();

          if (typeof column !== 'undefined') {
            column.addCard(card);
          }
        }
      };

      var updateCards = function updateCards(data) {
        var updatedColumns = {};
        data.forEach(function (datum) {
          var card = cardsByID[datum.id];
          card.update(datum.attributes);

          if (typeof card !== 'undefined') {
            var columnID = datum.attributes.column;
            var column = columnsByID[columnID];

            if (typeof column !== 'undefined') {
              updatedColumns[columnID] = column;
            } else {
              console.warn("Can't find column ".concat(columnID));
            }
          }
        });
        Object.values(updatedColumns).forEach(function (column) {
          column.redraw();
        });
      };

      var deleteCard = function deleteCard(id) {
        var card = cardsByID[id];

        if (card) {
          card.detatch();
        } else {
          console.warn("Could not find card with ID ".concat(id, "."));
        }
      };

      var db = new Database("ws://".concat(window.location.host, "/ws/kanban/").concat(id, "/"));
      var disconnected = false;
      db.on('connected', function () {
        console.debug('Opened a socket to the Kanban board.');
        db.list({
          type: 'columns'
        });

        if (disconnected) {
          disconnected = false;
          toast.success('Re-established connection with the server.');
        }
      }).on('disconnected', function () {
        console.warn('Kanban board socket closed unexpectedly.');

        _this2.emit('error');

        _this2.emit('freeze');

        disconnected = true;
        toast.error('Lost connection to the server.');
      }).on('listed', function (type, data) {
        switch (type) {
          case 'columns':
            loadColumns(data);
            return;

          case 'cards':
            updateCards(data);
            return;
        }

        console.warn('Unrecognised content type.', type);
      }).on('created', function (type, data) {
        switch (type) {
          case 'cards':
            createCard(data);
            return;
        }

        console.warn('Unrecognised content type.', type);
      }).on('updated', function (type, data) {
        switch (type) {
          case 'cards':
            updateCard(data);
            return;
        }

        console.warn('Unrecognised content type.', type);
      }).on('deleted', function (type, data) {
        switch (type) {
          case 'cards':
            deleteCard(data.id);
            return;
        }

        console.warn('Unrecognised content type.', type);
      });
      db.connect();
      return _this2;
    }

    return Board;
  }(EventEmitter);

  var BoardDetailView =
  /*#__PURE__*/
  function (_ViewBase) {
    _inherits(BoardDetailView, _ViewBase);

    function BoardDetailView() {
      _classCallCheck(this, BoardDetailView);

      return _possibleConstructorReturn(this, _getPrototypeOf(BoardDetailView).apply(this, arguments));
    }

    _createClass(BoardDetailView, [{
      key: "classNames",
      value: function classNames() {
        return ['projects', 'board-detail'];
      }
    }, {
      key: "ready",
      value: function ready() {
        var $ = this.app.$;
        $('.kanban-board[data-id]').each(function () {
          var dom = $(this);
          var board = new Board(dom, dom.data('id'));
          board.on('cards.create.request', function (request) {
            request.accept({
              placeholder: 'Episode title'
            });
          });
          dom.removeAttr('data-id');
          dom.data('kanban-board', board);
        });
      }
    }]);

    return BoardDetailView;
  }(ViewBase);

  var Task =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(Task, _EventEmitter);

    function Task(settings) {
      var _this;

      _classCallCheck(this, Task);

      var $ = window.$;
      _this = _possibleConstructorReturn(this, _getPrototypeOf(Task).call(this));
      _this.id = settings.id;

      _this.attach = function (dom) {
        var container = $('<div>').addClass('checkbox');
        var label = $('<label>').text(settings.name).attr('for', "id_".concat(settings.id));
        var input = $('<input>').attr('type', 'checkbox').attr('id', "id_".concat(settings.id));
        input.on('click', function (e) {
          var complete = input.is(':checked');
          e.preventDefault();

          if (!input.attr('disabled')) {
            _this.emit('mark', complete);
          }

          return false;
        });

        var update = function update() {
          if (settings.completed) {
            input.prop('checked', 'checked').attr('checked', 'checked');
          } else {
            input.prop('checked', false).removeAttr('checked');
          }
        };

        container.append(input);
        container.append('&nbsp;');
        container.append(label);
        container.data('task', _assertThisInitialized(_this));
        dom.append(container);

        _this.on('freeze', function () {
          input.attr('disabled', 'disabled');
        }).on('unfreeze', function () {
          input.removeAttr('disabled');
        }).on('updated', function () {
          update();
        });

        update();
      };

      _this.update = function (newSettings) {
        settings = $.extend({
          id: settings.id
        }, newSettings);

        _this.emit('updated');
      };

      _this.on('mark', function () {
        _this.emit('freeze');
      });

      return _this;
    }

    return Task;
  }(EventEmitter);

  var $$3 = window.$;

  var TaskList =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(TaskList, _EventEmitter);

    function TaskList(dom) {
      var _this;

      _classCallCheck(this, TaskList);

      var idParts = dom.data('id').split('/');
      var projectID = idParts[0];
      var deliverableID = idParts[1];
      var url = "ws://".concat(window.location.host, "/ws/projects/").concat(projectID, "/deliverables/").concat(deliverableID, "/");
      var db = new Database(url);
      var $ = window.$;
      var body = dom.find('.card-body');
      var disconnected = false;
      var tasksByID = {};
      var updating = false;
      _this = _possibleConstructorReturn(this, _getPrototypeOf(TaskList).call(this));

      _this.on('freeze', function () {
        body.find(':input').attr('disabled', 'disabled');
      }).on('unfreeze', function () {
        body.find(':input').each(function () {
          var input = $(this);

          if (input.data('frozen')) {
            return;
          }

          input.removeAttr('disabled');
        });
      });

      db.on('updated', function (type) {
        if (type === 'deliverables') {
          body.animate({
            opacity: 0
          }, 333, function () {
            db.list({
              type: 'tasks'
            });
          });
          updating = true;
        }
      }).on('listed', function (type, data) {
        if (type === 'tasks') {
          body.html('');
          var added = false;
          data.forEach(function (settings) {
            var attrs = $.extend({
              id: settings.id
            }, settings.attributes);
            var task = new Task(attrs).on('mark', function (complete) {
              db.update({
                type: 'tasks',
                id: settings.id,
                attributes: {
                  completed: complete
                }
              });
            });
            tasksByID[settings.id] = task;
            task.attach(body);
            added = true;
          });

          if (!added) {
            body.html('<center>' + '<span class="h1 m-0">☕️</span><br>' + 'There&rsquo;s nothing more for you to do here!' + '</center>');
          }

          if (updating) {
            body.animate({
              opacity: 1
            }, 333);
          }
        }
      }).on('updated', function (type, data) {
        if (type === 'tasks') {
          var task = tasksByID[data.id];

          if (typeof task === 'undefined') {
            console.warn("Task ".concat(data.id, " not found."));
            return;
          }

          task.update(data.attributes);
          task.emit('unfreeze');
        }
      }).on('connected', function () {
        db.list({
          type: 'tasks'
        });

        _this.emit('unfreeze');

        if (disconnected) {
          disconnected = false;
          toast.success('Re-established connection with the server.');
        }
      }).on('disconnected', function () {
        _this.emit('error');

        _this.emit('freeze');

        disconnected = true;
        toast.error('Lost connection to the server.');
      });
      body.html('<center class="my-5 text-muted">' + '    <i class="fa fa-spin fa-spinner fa-2x fa-fw"></i>' + '</center>');

      _this.emit('freeze');

      db.connect();
      return _this;
    }

    return TaskList;
  }(EventEmitter);

  var StageTimeline =
  /*#__PURE__*/
  function (_EventEmitter2) {
    _inherits(StageTimeline, _EventEmitter2);

    function StageTimeline(dom) {
      var _this2;

      _classCallCheck(this, StageTimeline);

      var idParts = dom.data('id').split('/');
      var projectID = idParts[0];
      var deliverableID = idParts[1];
      var url = "ws://".concat(window.location.host, "/ws/projects/").concat(projectID, "/deliverables/").concat(deliverableID, "/");
      var db = new Database(url);
      var updating = false;

      var refresh = function refresh(obj) {
        var stageIndex = 0;
        dom.find('.timeline-stage').each(function (index) {
          var stage = $$3(this);
          var stageID = stage.data('id');

          if (obj.stage) {
            if (stageID.toString() === obj.stage.id.toString()) {
              stage.addClass('active');
              stageIndex = index;
            } else {
              stage.removeClass('active');
            }
          }

          stage.removeAttr('data-id');
        });
        dom.find('.timeline-stage').each(function (index) {
          var stage = $$3(this);
          var isReady = stage.hasClass('ready');
          var isPending = stage.hasClass('pending');
          var timeout = updating ? 10 : index * 333;
          var makeReady = false;
          var makePending = false;

          if (index <= stageIndex) {
            if (!isReady) {
              stage.addClass('ready');
              makeReady = true;
            }
          } else {
            if (!isPending) {
              stage.addClass('pending');
              makePending = true;
            }
          }

          if (makeReady) {
            if (isPending) {
              stage.removeClass('pending').addClass('changing');
              stage.delay(timeout).queue(function (next) {
                stage.removeClass('changing').addClass('ready');
                next();
              });
            } else if (!isReady) {
              stage.addClass('changing');
              stage.delay(timeout).queue(function (next) {
                stage.removeClass('changing').addClass('ready');
                next();
              });
            }
          } else if (makePending) {
            if (isReady) {
              stage.removeClass('ready').addClass('changing');
              stage.delay(timeout).queue(function (next) {
                stage.removeClass('changing').addClass('pending');
                next();
              });
            } else if (!isPending) {
              stage.addClass('changing');
              stage.delay(timeout).queue(function (next) {
                stage.removeClass('changing').addClass('pending');
                next();
              });
            }
          }
        });
      };

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(StageTimeline).call(this));
      db.on('connected', function () {
        db.get({
          type: 'deliverables'
        });
      }).on('got', function (type, data) {
        if (type === 'deliverables') {
          refresh(data.attributes);
        }
      }).on('updated', function (type, data) {
        if (type === 'deliverables') {
          updating = true;
          refresh(data.attributes);
        }
      });
      db.connect();
      return _this2;
    }

    return StageTimeline;
  }(EventEmitter);

  var DeliverableDetailView =
  /*#__PURE__*/
  function (_ViewBase) {
    _inherits(DeliverableDetailView, _ViewBase);

    function DeliverableDetailView() {
      _classCallCheck(this, DeliverableDetailView);

      return _possibleConstructorReturn(this, _getPrototypeOf(DeliverableDetailView).apply(this, arguments));
    }

    _createClass(DeliverableDetailView, [{
      key: "classNames",
      value: function classNames() {
        return ['projects', 'deliverable-detail'];
      }
    }, {
      key: "ready",
      value: function ready() {
        $$3('.stage-timeline[data-id]').each(function () {
          var dom = $$3(this);
          var timeline = new StageTimeline(dom);
          dom.data('timeline', timeline);
        });
        $$3('.card.tasks[data-id]').each(function () {
          var dom = $$3(this);
          var list = new TaskList(dom);
          dom.data('task-list', list);
        });
      }
    }]);

    return DeliverableDetailView;
  }(ViewBase);

  window.Pico = new App({
    plugins: [WizardPlugin, DropzonePlugin, TypeaheadPlugin],
    views: [CreateProjectView, BoardDetailView, DeliverableDetailView]
  });

}));
//# sourceMappingURL=pico.js.map
