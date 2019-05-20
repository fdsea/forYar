
var LDGATEWAY = (function($, Cleave, ButtonState){
	var val = {
		GATEWAY: '.gateway-modal',
		GATEWAY_OPEN_CLASS: 'gateway-modal--active',
		attemptsAmount: 0,
		inputElements: '.label',
		errorClass: 'input--is-error',
		successClass: 'input--is-success',
		button: '.gw-button--for-action',
		tryAgainButton: '.gw-content__error-btn-for-action',
		successButton: '.gw-success__action-btn-for-action',
		termsAndConditionElement: {
			el: '.gw-form__input--checkbox',
			label: '.gw-form__checkbox-plug',
			'data-element-validate-status': 'error',
			currentValue: false,
			reg: null
		},
		cardBrands: [
			{
				alias: 'visa',
				name: 'Visa',
				codeName: 'CVV',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [16],
				pattern: /^4\d*$/
			},
			{
				alias: 'mastercard',
				name: 'MasterCard',
				codeName: 'CVC',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [16],
				pattern: /^(5[1-5]|222[1-9]|2[3-6]|27[0-1]|2720)\d*$/
			},
			{
				alias: 'amex',
				name: 'American Express',
				codeName: 'CID',
				codeLength: 4,
				gaps: [4, 10],
				lengths: [15],
				pattern: /^3[47]\d*$/
			},
			{
				alias: 'diners',
				name: 'Diners Club',
				codeName: 'CVV',
				codeLength: 3,
				gaps: [4, 10],
				lengths: [14],
				pattern: /^3(0[0-5]|[689])\d*$/
			},
			{
				alias: 'discover',
				name: 'Discover',
				codeName: 'CID',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [16, 19],
				pattern: /^(6011|65|64[4-9])\d*$/
			},
			{
				alias: 'jcb',
				name: 'JCB',
				codeName: 'CVV',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [16],
				pattern: /^(2131|1800|35)\d*$/
			},
			{
				alias: 'unionpay',
				name: 'UnionPay',
				codeName: 'CVN',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [16, 17, 18, 19],
				pattern: /^62[0-5]\d*$/
			},
			{
				alias: 'maestro',
				name: 'Maestro',
				codeName: 'CVC',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [12, 13, 14, 15, 16, 17, 18, 19],
				pattern: /^(5[0678]|6304|6390|6054|6271|67)\d*$/
			},
			{
				alias: 'mir',
				name: 'MIR',
				codeName: 'CVC',
				codeLength: 3,
				gaps: [4, 8, 12],
				lengths: [16],
				pattern: /^22\d*$/
			}
		],
		cardInputElement: {
			el: '.gw-form__input--card',
			label: '.gw-form__label--card',
			'data-element-validate-status': 'error',
			currentValue: '',
			reg: null,
			len: null
		},
		fieldsData: [
			{
				el: '.gw-form__input--date-mm',
				label: '.gw-form__label--date-mm',
				reg: /^[0-9]{1,2}$/gi,
				'data-element-validate-status': 'error',
				currentValue: ''
			},
			{
				el: '.gw-form__input--date-yy',
				label: '.gw-form__label--date-yy',
				reg: /^[0-9]{2,4}$/gi,
				'data-element-validate-status': 'error',
				currentValue: ''
			},
			{
				el: '.gw-form__input--cvv',
				label: '.gw-form__label--cvv',
				reg: /^[0-9]{3,4}$/gi,
				'data-element-validate-status': 'error',
				currentValue: ''
			},
			{
				el: '.gw-form__input--name',
				label: '.gw-form__label--name',
				reg: /^([a-zA-Z]+)\s([a-zA-Z]+)$/gi,
				'data-element-validate-status': 'error',
				currentValue: ''
			}
		], 
		statuses: [],
		st: [],
		tokenTabClass: '.gw-content__token-item',
		tokenTabActiveClass: 'gw-content__token-item--is-active',
		tokenTabData: 'data-token-tab-id',
		tokenActionButton: '.gw-token__next-button-for-action',
		closedElements: '.gw-benefits__close-icon-mobile, .gw-benefits__close-icon',
		currentTokenTabActive: '1',
		isNth1Checked: false,
		paths:{
			verify: 'age/verify',
			decline: 'age/oneclick_card'
		},
		currentConsistent: {
			mode: 'desktop',
			submode: 'token',
			tokensAmount: null
    	},
		controllers: function () {
			var  self = this;
			self.setFieldsControllers();

			$(window).resize(function () {
				var currentWidth = $(window).width();
				self.setGatewayMode(currentWidth);
				//self.setGatewaySubMode(currentWidth);
			});

			$(document).on('click', self.closedElements, function () {
				self.closeGateway();
			});

			$(document).on('click', self.tryAgainButton, function () {
				event.preventDefault();
				/** Globica **/
				Gl.SendGoalEvent('CLICK_TRY_AGAIN_LTM', {tid: __globalTagId__});
				/************/
				self.setGatewaySubMode($(window).width(), 'form');
			});

			$(document).on('click', self.successButton, function () {
				 /** Globica **/
                Gl.SendGoalEvent('TICK_ON_UPGRADE', _access3);
                /************/
				if ( this.isNth1Checked || $('.recharge__input-nth2').prop('checked') ) {
					window.location.href = site_url + 'age/upgrade';
				}else{
					window.location.href = site_url + '';
				}
			});

			$(document).on('click', self.tokenActionButton, function () {
				self.currentConsistent.submode = 'form';
				self.setGatewaySubMode($(window).width(), self.currentConsistent.submode);
				self.setTokensAmount();
			});
					
			$(document).on('click', self.tokenTabClass, function () {
				$(self.tokenTabClass).removeClass(self.tokenTabActiveClass);
				$(this).addClass(self.tokenTabActiveClass);
				self.currentTokenTabActive = $(this).attr(self.tokenTabData);
				self.setTokensAmount(); 
			});
			
			$(self.button).on('click', function () {

				self.setNth1Check();

                var btn = new ButtonState({
					type: 'proc',
					iconClass: 'send-animation',
					elLink: self.button
				});

                self.statuses = [];
                
				self.fieldsData.forEach(function ( field ) {
                    self.checkAllFields();
					self.checkedField(field);
					self.removeActiveClasses(field);
					if ( field['data-element-validate-status'] === 'success' ){
                        self.statuses.push('success');
					}else if( field['data-element-validate-status'] === 'error' ){
                        self.statuses.push('error');
					}	
                });

                self.validateCardData(self.cardInputElement);

                self.validateTermsAndConditionCheckbox();

                btn.startAnimation();

				if (self.statuses.indexOf('error') !== -1) {

                    //btn.stopAnimation(); 

                    //console.log('error');

                    self.statuses = [];
					self.attemptsAmount += 1;
					self.fieldsData.forEach(function(field){
						self.checkedField(field)
                    });
                    self.checkedField(self.cardInputElement);
                    self.checkedTermsAndConditionCheckbox();
				}else{
					self.sendData(btn);
					console.log('send!')
                }
                //console.log('--log', self.statuses);
            });
            $(self.termsAndConditionElement.el).on('change', function () {
                self.termsAndConditionElement.currentValue = $(this).prop('checked');
                self.checkedTermsAndConditionCheckbox();

            });
		},
		sendData: function ( buttonObj ) {

			var self = this;

			var xsales = this.getCrosses();

			var data = this.getData();

			data.xsales = xsales;

			var currentURL = this.getPath();
			//console.log(data, currentURL);
			//self.setGatewaySubMode($(window).width(), 'success');

			self.getCheckBoxStatuses();
			
			$('#thmContainer').load(site_url + 'age/thm', function () {
				data.thmSessionId = $('#thm_session_id').val();
				if( __private_content_data__ ) {
					data.content = __private_content_data__;
				}

				$.ajax({
					url: site_url + currentURL,
					type: 'POST',
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: 'json',
					beforeSend: function (xhr) {
						$('.button-check-card').prop('disabled', true);
					}
				}).done(function (resp) {
					buttonObj.stopAnimation();
					
					if ( resp.result ) {

						if ( self.currentConsistent.mode === 'decline' ){
							closeGateway();
							__lookachat__.removeBanner('main', $('.gateway-modal__content').attr('data-decline-user-id'), 0);
							// dispatch
						}else{
							self.setNth2Check();
							self.setGatewaySubMode($(window).width(), 'success');
						}
					} else {
						if( self.currentConsistent.mode === 'decline' ){
							self.setGatewaySubMode($(window).width(), 'form');
						}else {
							showError();
						}
					}
				}).fail(function (jqXHR, textStatus){
					buttonObj.stopAnimation();
					self.setGatewaySubMode($(window).width(), 'err');
				});
				
			});
		},
		open: function (config) {
			var self = this;
			if ( config ) {
				for ( var i in config ) {
					if ( config.hasOwnProperty(i) ) {
						this.currentConsistent[i] = config[i];
					}
				}
			}
			this.setGatewayMode($(window).width(), this.currentConsistent.mode);
			this.setGatewaySubMode($(window).width(), this.currentConsistent.submode);
			$(self.GATEWAY).addClass(self.GATEWAY_OPEN_CLASS);
		},
		closeGateway: function  () {
			var self = this;
			$(self.GATEWAY).removeClass(self.GATEWAY_OPEN_CLASS);
		},
		getCheckBoxStatuses: function () {
			var _access1 = $('#access1').prop('checked');
			var _access2 = $('#access2').prop('checked');
			var _access3 = $('#access3').prop('checked');
			var _terms = $('#acceptTerms').prop('checked') ? '1': '0';
			var _101dvd;
			var _javHd;
			var _premiumProfile;
			if(_terms === '1') {
				/** Globica **/
				Gl.SendGoalEvent('TICK_ON_TERMS', {pd: _terms, tid: __globalTagId__});
				
				_101dvd = _access1 ? '1' : '0';
				_javHd = _access2 ? '1' : '0';
				_premiumProfile = _access3 ? '1' : '0';
				
				Gl.SendGoalEvent('TICK_ON_1001DVD', {pd: _101dvd, tid: __globalTagId__});
				Gl.SendGoalEvent('TICK_ON_JAVHD', {pd: _javHd, tid: __globalTagId__});

				/*************/
			}
		},
		getPath: function () {
			if ( this.currentConsistent.mode === 'decline' ) {
				return this.paths.decline;
			}else{
				return this.paths.verify;
			}
		},
		getData: function () {
			var month = +$('.gw-form__input--date-mm').val() < 10 ? '0'+$('.gw-form__input--date-mm').val(): +$('.gw-form__input--date-mm').val();
			return {
				number: $('.gw-form__input--card').val().split(' ').join(''),
				holder: $('.gw-form__input--name').val(),
				exp: month +'20'+$('.gw-form__input--date-yy').val(),
				cvv: $('.gw-form__input--cvv').val(),
			};
		},
		getCrosses: function () {

			var crosses = [];

			if ( $('#access1').prop('checked') ) {
				crosses.push($('#access1').val());
			}
			if ( $('#access2').prop('checked') ) {
				crosses.push($('#access2').val());
			}
			if ( $('#access3').prop('checked') ) {
				crosses.push($('#access3').val());
			}

			if ( this.currentConsistent.mode === 'decline' ) {
				return [];
			}else{
				return crosses;
			}	
		},
		setNth1Check: function () {
			var self = this;
			var isChecked = $('.recharge__input-nth1').prop('checked');
			self.isNth1Checked = isChecked;
		},
		setNth2Check: function () {
			if ( this.isNth1Checked ) {
				$('.recharge-nth2').hide();
				$('.added-content-nth2').hide();
			}
		},
		setTokensAmount: function () {
			var self = this;
			$('[data-token-tab-id]').each( function () {
				if ( $(this).attr('data-token-tab-id') === self.currentTokenTabActive) {
					self.currentConsistent.tokensAmount = $(this).attr('data-tokens-amount');
					$('._tokens-amount').text(self.currentConsistent.tokensAmount);
				}
			});
		},
        setGatewayMode: function (wdt, value) {
            var self = this;
            if ( wdt >= 935) {
                this.currentConsistent.mode = "desktop"
            }
            if (wdt >= 635 && wdt < 935) {
                this.currentConsistent.mode = "tablet"
            }
            if (wdt < 635) {
              this.currentConsistent.mode = "mobile"
            }
			
			if ( value ) {
				$('.gateway-modal').attr('data-is-device-mode', value);
			}else {
				$('.gateway-modal').attr('data-is-device-mode', self.currentConsistent.mode);
			}
		},
		setGatewaySubMode: function (wdt, value) {
			var self = this;
			if (wdt < 635 && this.currentConsistent.submode === null) {
                this.currentConsistent.submode = 'token';
            }
			
			$('.gateway-modal').attr('data-is-device-submode', self.currentConsistent.submode);

			if ( value ) {
				$('.gateway-modal').attr('data-is-device-submode', value);
			}
		},
        catchChangeYYMM: function () {
            var self = this;
            if ( self.attemptsAmount > 0 ) {
                self.checkAllFields();

                self.fieldsData.forEach( function( field ){
                    self.checkedField( field );
                });
            }
        },
        setActiveTab: function () {
            var self = this;
            $(self.tokenTabClass).each(function () {
                if ( $(this).attr(self.tokenTabData) === self.currentTokenTabActive ){
                    $(this).addClass(self.tokenTabActiveClass);
                }
            });
        },
        validateTermsAndConditionCheckbox: function () {
            this.checkedTermsAndConditionCheckbox();
            this.removeActiveClasses(this.termsAndConditionElement);
        },
        checkedTermsAndConditionCheckbox: function () {
            var self = this;
            var label = $(self.termsAndConditionElement.label);
            if ( self.termsAndConditionElement.currentValue ){
                self.termsAndConditionElement['data-element-validate-status'] = 'success';
                label.addClass(self.successClass);
                self.statuses.push('success');
            }else{
                self.termsAndConditionElement['data-element-validate-status'] = 'error';
                label.addClass(self.errorClass);
                self.statuses.push('error');
            }
        },
        validateCardData: function (field) {    
            this.checkedField(field);
            this.removeActiveClasses(field);
            if ( field['data-element-validate-status'] === 'success' ){
                this.statuses.push('success');             
            }else if( field['data-element-validate-status'] === 'error' ){
                this.statuses.push('error');
            }	
        },
        checkAllFields: function () {
            var self = this;
            this.fieldsData.forEach(function (field, index) {
                field.currentValue = $(field.el).val();
                //console.log($(field.el).val())
            });
            
        },
		setFieldsControllers: function () {
			var self = this;
			this.fieldsData.forEach(function (field, index) {
				$(field.el).on('keyup', function (e) {
					field.currentValue = $(field.el).val();
					if (self.attemptsAmount !== 0){
                        self.checkedField(field);               
					}
                });
            });

            if ( self.attemptsAmount !== 0 ) {
                self.validateCardData (self.cardInputElement);
            }
        
            var card = new Cleave(self.cardInputElement.el, {
                creditCard: true,
                onCreditCardTypeChanged: function (type) {
                  //setBankIcon(type);
                },
                onValueChanged: function (e) {
                  var currentValue = self.validateCardNumber(self.cardBrands, e.target.rawValue);
                  var fieldValue = e.target.rawValue;
                  self.cardInputElement.currentValue = fieldValue;

                  if ( currentValue.f && currentValue.i !== 'none' ) {
					self.cardInputElement.reg = self.cardBrands[currentValue.i].pattern;
					self.cardInputElement.len = self.cardBrands[currentValue.i].lengths[0];
                    if (e.target.rawValue.length < self.cardBrands[currentValue.i].lengths[0]) {
                        self.cardInputElement['data-element-validate-status'] = 'error';
                    } else if (e.target.rawValue.length >= self.cardBrands[currentValue.i].lengths[0]){
                        self.cardInputElement['data-element-validate-status'] = 'success';
                    } else {
                        self.cardInputElement['data-element-validate-status'] = 'error';
                    }
                  }
                  if (currentValue.f && currentValue.i === 'none') {
                    $(self.cardInputElement.el).attr('data-validation', 'success');
                  }
                  if ( self.attemptsAmount !== 0 ) {
                    self.checkedField(self.cardInputElement);
                  }
                  self.checkAllFields();
                }
              });
        },
        validateCardNumber(cardsInfo, currentValue){
            var index;
            var currentCard = cardsInfo.find(function(card, i){
                if(card.pattern.test(currentValue)){
                    return card;
                }
            });
    
            if( currentCard ){
                index = cardsInfo.findIndex(function(card){
                    return card.alias === currentCard.alias;
                })
            }else{
                index = 'none';
            }
            return {f: !!currentCard, i: index};
        },
		checkedField: function (field) {
			this.setValidate(field, this.validateField(field));
		},
		setValidate: function (config, status) {
			var self = this;
			self.removeActiveClasses(config);
			if(status === 'success') {
				$(config.label).addClass(self.successClass);
			}else if(status === 'error'){
				$(config.label).addClass(self.errorClass);
			}
		},
		removeActiveClasses: function (config) {
			var self = this;
			$(config.label).removeClass(self.successClass);
			$(config.label).removeClass(self.errorClass);	
		},
		validateField: function (config) {
            //console.log((config.currentValue.search(config.reg)), ' -- ', config.el);
			if( ((config.currentValue.search(config.reg) !== -1) && (config.currentValue !== "")) ){
				if ( config.len ) {
					if ( config.currentValue.length < config.len ) {
						config['data-element-validate-status'] ='error';
						return 'error'
					}else{
						config['data-element-validate-status'] ='success';
						return 'success';
					}
				}else{
					config['data-element-validate-status'] ='success';
					return 'success';
				}
			}else {
				config['data-element-validate-status'] = 'error';
				return 'error'
			};
		},
		init: function () {
            this.catchChangeYYMM = this.catchChangeYYMM.bind(this);
            this.controllers();
			this.setActiveTab();
			this.setTokensAmount();
			this.setGatewayMode($(window).width());
			this.setGatewaySubMode($(window).width(), this.currentConsistent.submode);
        }
	};
    return val;
    
}($, Cleave, ButtonState));

LDGATEWAY.init();

function ButtonState ( config ) {
	this.uniqClass = config.iconClass || '_animation-icon';
	this.type = config.type;
	this.el = config.elLink;
	this.innerElements = Object.create(null);
	this.innerElements.arrow = '<svg viewBox="0 0 24 24"><path d="M19,8L15,12H18A6,6 0 0,1 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20A8,8 0 0,0 20,12H23M6,12A6,6 0 0,1 12,6C13,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4A8,8 0 0,0 4,12H1L5,16L9,12"></path></svg>';
	this.innerElements.stop = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z"></path></svg>';
	this.innerElements.star = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"</path></svg>';
	this.innerElements.proc = '<span>Processing</span><span class="gw-button__dot"></span><span class="gw-button__dot"></span><span class="gw-button__dot"</span>';
	this.buttonLink = null;
	this.buttonHeight = null;
	this.buttonContent = '';
	this.stopAnimationCallback = function () { };
	this.startAnimationCallback = function () { };
}
ButtonState.prototype.getElementContainer = function (icon) {
	return '<span class='+ this.uniqClass +' style="position: absolute;top: 50%; left: 50%; transform: translate(-50%, -50%);display:flex; align-items: center">'+ icon +'</span>';
}
ButtonState.prototype.setIcon = function (name, markup) {
	this.innerElements[name] = markup;
}
ButtonState.prototype.getButtonElement = function (el) {
	this.buttonLink = document.querySelector(el);
	this.buttonContent = this.buttonLink.innerHTML;
	this.buttonHeight = this.buttonLink.offsetHeight;
}
ButtonState.prototype.startAnimation = function (elementType) {
	this.getButtonElement(this.el);
	this.buttonLink.innerHTML = elementType 
		? this.getElementContainer(this.innerElements[elementType]) 
		: this.getElementContainer(this.innerElements[this.type]);
	this.buttonLink.setAttribute('disabled', true);
	this.buttonLink.style.height = this.buttonHeight + 'px';
	this.startAnimationCallback();
}
ButtonState.prototype.stopAnimation = function (el) {
	this.buttonLink.innerHTML = this.buttonContent;
	this.buttonLink.removeAttribute('disabled');
	this.buttonLink.style.height = '40px';
	this.stopAnimationCallback();
}
ButtonState.prototype.setStartAnimationCallback = function (callback) {
	this.startAnimationCallback = callback;
}
ButtonState.prototype.setStopAnimationCallback = function (callback) {
	this.stopAnimationCallback = callback;
}


"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DataPicker =
/*#__PURE__*/
function () {
  function DataPicker(config) {
    _classCallCheck(this, DataPicker);

    this.inputElement = config.inputElement;
    this.buttonElement = config.buttonElement;
    this.parent = config.parent;
    this.morph = config.morph || {
      data: 'year'
    };
    this.containerID = null;
    this.uniqContainerClass = null;
    this.uniqCellClass = null;
    this.bridgeElementValue = null;
    this.currentValue = null;
    this.getCurrentValue = this.getCurrentValue.bind(this);

    this.getBridgedElementValue = function () {
      return {
        value: this.currentValue,
        container: this.uniqContainerClass
      };
    };
    this.changeCallback = function () {};

    this.init();
  }

  _createClass(DataPicker, [{
    key: "setController",
    value: function setController() {
      var _this = this;

      var self = this;
      $(document).on('click', this.buttonElement, function () {
        _this.createPickerBlock(_this.getCells(_this.createInterval()));

        $(".".concat(_this.getBridgedElementValue().container)).removeClass('data-picker-container--active');
        var container = $(".".concat(_this.uniqContainerClass));
        var containerSize = {
          width: container.outerWidth(true),
          height: container.outerHeight(true)
        };
        var containerCoordinates = {
          top: _this.getButtonElementsCoordinaties().top + containerSize.height / 13,
          left: _this.getButtonElementsCoordinaties().left - 1
        };
        container.addClass('data-picker-container--active');
        container.offset(containerCoordinates);
      });
      $(document).on('click', ".".concat(self.uniqCellClass), function (e) {
        e.preventDefault();
        e.stopPropagation();  
        self.currentValue = $(this).attr('data-dp-cell');
        if( _this.morph.data === 'year' ){
            $(self.inputElement).attr('value', self.currentValue - 2000);
        }else{
            $(self.inputElement).attr('value', self.currentValue);
        }

        _this.changeCallback();

        $(".".concat(self.uniqContainerClass)).removeClass('data-picker-container--active');
        $(".".concat(self.uniqContainerClass)).css({ display: 'none' })
      });
      
      $(document).on('focus', self.inputElement, function () {
          $(this).blur();
      });
     
    }
  },{
    key: 'changeBridge',
    value: function ( callback ) {
        this.changeCallback = callback;
    }
  },{
    key: "createPickerBlock",
    value: function createPickerBlock(childs) {
      var container = this.getDataElement({
        name: 'div',
        attributes: {
          class: "data-picker-container ".concat(this.uniqContainerClass),
          'data-dp-container': "".concat(this.containerID)
        },
        childs: _toConsumableArray(childs).reverse()
      });
      $(".".concat(this.uniqContainerClass)).remove();
      $(this.parent).append(container);
    }
  }, {
    key: "createCell",
    value: function createCell(value) {
      return this.getDataElement({
        name: 'button',
        attributes: {
          class: "data-picker-cell ".concat(this.uniqCellClass),
          'data-dp-cell': value,
          tabindex: '2'
        },
        value: this.morph.data === 'year' ? value - 2000 : value
      });
    }
  }, {
    key: "getCells",
    value: function getCells(_ref) {
      var min = _ref.min,
          max = _ref.max;
      var cells = [];

      for (var i = min; i <= max; i++) {
        cells.push(this.createCell(i));
      }

      return cells;
    }
  }, {
    key: "createInterval",
    value: function createInterval() {
      var currentDate = this.getCurrentDate();
      var currentMorph = this.morph.data;
      var min = null,
          max = null;
      var bridgedValue = this.getBridgedElementValue().value;

      if (currentMorph === 'year') {
        if (bridgedValue === null) {
          min = currentDate.year;
          max = min + 10;
        }

        if (bridgedValue > currentDate.month) {
          min = currentDate.year;
          max = min + this.morph.interval;
        }

        if (bridgedValue <= currentDate.month && bridgedValue !== null) {
          min = currentDate.year + 1;
          max = min + this.morph.interval;
        }
      }

      if (currentMorph === 'month') {
        if (bridgedValue === null) {
          min = 1;
          max = 12;
        } else if (bridgedValue > currentDate.year) {
          min = 1;
          max = 12;
        }

        if (bridgedValue <= currentDate.year && bridgedValue !== null) {
          min = currentDate.month + 1;
          max = 12;
        }
      }
        return {
            min: min,
            max: max
        };
    }
  }, {
    key: "getUniqueValue",
    value: function getUniqueValue() {
      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6;
      var str = 'asdfghjzxcvbnmkqwertyuiop';
      var strArr = str.split('');
      var output = '';

      for (var i = 0; i < amount; i++) {
        output += strArr[Math.floor(Math.random() * strArr.length)];
      }

      this.containerID = output;
      this.uniqContainerClass = "data-picker-container__uq".concat(this.containerID);
      this.uniqCellClass = "data-picker-cell__uq".concat(this.containerID);
    }
  }, {
    key: "getDataElement",
    value: function getDataElement(_ref2) {
      var name = _ref2.name,
          attributes = _ref2.attributes,
          value = _ref2.value,
          childs = _ref2.childs;
      var el = document.createElement(name);

      if (attributes) {
        for (var p in attributes) {
          el.setAttribute(p, attributes[p]);
        }
      }

      if (value) {
        el.innerHTML = value;
      }

      if (childs && childs.length !== 0) {
        childs.forEach(function (child) {
          return el.appendChild(child);
        });
      }

      return el;
    }
  }, {
    key: "getCurrentDate",
    value: function getCurrentDate() {
      var today = new Date();
      return {
        year: today.getFullYear(),
        month: today.getMonth() + 1
      };
    }
  }, {
    key: "getButtonElementsCoordinaties",
    value: function getButtonElementsCoordinaties() {
      return $(this.buttonElement).offset();
    }
  }, {
    key: "bridge",
    value: function bridge(callback) {
      this.getBridgedElementValue = callback;
    }
  }, {
    key: "getCurrentValue",
    value: function getCurrentValue() {
      return {
        value: this.currentValue,
        container: this.uniqContainerClass
      };
    }
  }, {
    key: "init",
    value: function init() {
      this.getUniqueValue();
      this.setController();
    }
  }]);

  return DataPicker;
}();

var year = new DataPicker({
  inputElement: '.gw-form__input--date-yy',
  buttonElement: '.field-part__plug-year',
  parent: '.gw-form__label--date-yy',
  morph: {
    data: 'year',
    interval: 10
  }
});
var month = new DataPicker({
  inputElement: '.gw-form__input--date-mm',
  buttonElement: '.field-part__plug-month',
  parent: '.gw-form__label--date-mm',
  morph: {
    data: 'month'
  }
});
year.bridge(month.getCurrentValue);
month.bridge(year.getCurrentValue);
year.changeBridge(LDGATEWAY.catchChangeYYMM);
month.changeBridge(LDGATEWAY.catchChangeYYMM);

function Confetti() {
    //canvas init
    var canvas = document.querySelector(".confetti");
    var ctx = canvas.getContext("2d");
  
    //canvas dimensions
    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    
    //particles
    var mp = 150; //max particles
    var types = ['circle', 'circle', 'triangle', 'triangle', 'line'];
    var colors = [
      [238, 96, 169],
      [68, 213, 217],
      [245, 187, 152],
      [144, 148, 188],
      [235, 234, 77]
    ];
    var angles = [
      [4,0,4,4],
      [2,2,0,4],
      [0,4,2,2],
      [0,4,4,4]
    ]
    var particles = [];
    for (var i = 0; i < mp; i++) {
      particles.push({
        x: Math.random() * W, //x-coordinate
        y: Math.random() * H, //y-coordinate
        r: Math.random() * 4 + 1, //radius
        d: Math.random() * mp, //density
        l: Math.floor(Math.random()*65+-30), // line angle
        a: angles[Math.floor(Math.random()*angles.length)], // triangle rotation
        c: colors[Math.floor(Math.random()*colors.length)], // color
        t: types[Math.floor(Math.random()*types.length)] //shape 
      })
    }   
    function draw(){
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < mp; i++) {
        var p = particles[i];
        var op = (p.r <= 3) ? 0.4 : 0.8;
        
        if (p.t == 'circle'){
          ctx.fillStyle = "rgba(" + p.c + ", "+ op +")";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
          ctx.fill();
        } else if (p.t == 'triangle'){
          ctx.fillStyle = "rgba(" + p.c + ", "+ op +")";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + (p.r*p.a[0]), p.y + (p.r*p.a[1]));
          ctx.lineTo(p.x + (p.r*p.a[2]), p.y + (p.r*p.a[3]));
          ctx.closePath();
          ctx.fill(); 
        } else if (p.t == 'line') {
          ctx.strokeStyle = "rgba(" + p.c + "," + op +")";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.l, p.y + (p.r * 5));
          ctx.lineWidth = 2;
          ctx.stroke();
        } 
  
      }
      update();
    }
    function update() {
  
      for (var i = 0; i < mp; i++) {
        var p = particles[i];
        p.y += Math.cos(p.d) + 1 + p.r / 2;
        p.x += Math.sin(0) * 2;
        
        if (p.x > W + 5 || p.x < -5 || p.y > H) {
          particles[i] = {
            x: Math.random() * W,
            y: -10,
            r: p.r,
            d: p.d,
            l: p.l,
            a: p.a,
            c: p.c,
            t: p.t
          };
        }
      }
    }
    setInterval(draw, 23);
  }
  window.onload = function(){
    Confetti();
  }

  $('.op').on('click', function () {
	LDGATEWAY.open({
		mode: 'desctop',
    submode: 'token'
	});
  });