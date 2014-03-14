/*!
 * Quizilla jQuery Plugin
 * http://github.com/quizilla
 *
 * @updated Jenuary 13, 2014
 * @version 0.2
 *
 * @author Marek Pałczyński
 * @copyright (c) 2014 Marek Pałczyński
 * @license MIT
 */

 // https://github.com/jquery-boilerplate/
;(function ( $, window, document, undefined ) {
	// Create the defaults once
	var pluginName = "quizilla",
	    defaults = {
			questions:         [],
			shuffleQuestions:  true,
			shuffleAnswers:    true,
			numberOfQuestions: 5,
			submitQuizText:    'Check my answers',
			checkDelay:        500,
			checkLabel:        'Check',
			onQuizCheck:       $.noop,
			onQuizDone:        $.noop
		};

	function Plugin(element, options) {
		this._defaults = defaults;
		this._name     = pluginName;
		this.element   = element;
		this.settings  = $.extend({}, defaults, options);
		this.init();
	}

	Plugin.prototype = {
		init: function() {
			this.renderQuiz();
			console.log(this);
			$('.quizilla-checkQuiz', this.element).on('click', $.proxy(function(e) {
				e.preventDefault();
				this.checkQuiz(this);
			}, this));
		},

		renderQuiz: function() {
			var id, question, answer, questionHTML, questionsHTML, answerHTML, answersHTML;
			// shuffle questions
			this.renderedQuestions = this.settings.shuffleQuestions? this.shuffle(this.settings.questions) :
			                         this.settings.questions;
			// limit questions
			this.renderedQuestions = this.renderedQuestions.slice(0, this.settings.numberOfQuestions);
			
			questionsHTML = $('<ol class="quizilla"></ol>');

			// loop through questions
			for (var qi = 0; qi < this.renderedQuestions.length; qi++) {
				question = this.renderedQuestions[qi];
				questionHTML = $('<li class="quizilla-question"><h3>' + question.question + '</h3></li>');

				// append question answers
				answersHTML = $('<ul class="quizilla-answers"></ul>');

				// shuffle question answers
				question.answers = this.settings.shuffleAnswers ? this.shuffle(question.answers) : question.answers; 
				          
				for(var ai = 0; ai < question.answers.length; ai++) {
					answer = question.answers[ai];
					id = this.randomId('quizilla-answer-input');
					
					answerHTML = $('<li class="quizilla-answer"></li>');
					answerHTML.append('<input type="radio" name="quizilla-question' + (qi+1) + '-answer" id="' + id 
						+ '" value="' + (ai+1) + '" data-correct="' + answer.correct + '" /> ');
					answerHTML.append('<label for="' + id + '">' + answer.answer + '</label>');
					answersHTML.append(answerHTML);
				}
				questionHTML.append(answersHTML);
				questionsHTML.append(questionHTML);
			}

			$(this.element).html(questionsHTML)
				.append('<div class="form-actions"><input type="button" class="quizilla-checkQuiz" value="' + this.settings.checkLabel + '" /></div>');
		},

		checkQuiz: function(button) {
			var plugin = this;
			plugin.settings.onQuizCheck();
			setTimeout(function() {
				var correct = 0;
				//    count = this.settings.numberOfQuestions > questions.length ? questions.length : plugin.config.numberOfQuestions;
				// loop over questions
				$('.quizilla-question', plugin.element).each(function(qi, questionEl) {
					questionEl = $(questionEl);
					var question = plugin.renderedQuestions[qi], answer, answerEl, isCorrect, checked;
					console.debug(qi, question, questionEl);

					// disable inputs
					$('input', questionEl).prop('disabled', true);

					// correct answer on question
					isCorrect = true;		
					for(var ai = 0; ai < question.answers.length; ai++) {
						answer   = question.answers[ai];
						answerEl = $('[name="quizilla-question'+(qi+1)+'-answer"][value="'+(ai+1)+'"]', questionEl);
						checked  = answerEl.is(':checked');
						answerEl = answerEl.parent();
						// each checked answer must be correct
						if (checked === !answer.correct) isCorrect = false;
						// mark correct answers
						if (answer.correct) answerEl.addClass('quizilla-answer-correct');
						// mark mismatched answers
						else if (checked) answerEl.addClass('quizilla-answer-fail');
 					}

					if (isCorrect) {
						correct++;
						questionEl.addClass('success');
						
					} else {
						questionEl.addClass('failure');
						// append "onfail" content
						if (question.fail) questionEl.append('<div>'+question.fail+'</div>')
					}
				});
				
				//$(button).parent().hide();
				plugin.settings.onQuizDone(correct, plugin.renderedQuestions.length);
			}, plugin.settings.checkDelay);
		},

		//+ Jonas Raoni Soares Silva
		//@ http://jsfromhell.com/array/shuffle [v1.0]
		shuffle: function(a) {
			for(var i, j = a.length, tmp; j; i = Math.floor(Math.random() * j), tmp = a[--j], a[j] = a[i], a[i] = tmp);
			return a;
		},

		randomId: function(prefix) {
			do {
				var id = (prefix || "") + Math.round(Math.random()*999999999 + 1);
			} while (document.getElementById(id));
			return id;
		}
	};

	// Add really lightweight plugin wrapper around the constructor, preventing against multiple instantiations
	$.fn[ pluginName ] = function(options) {
		this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
		return this; // chain jQuery functions
	};
})( jQuery, window, document );