import { set, get, computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	repo: service(),
	tagName: 'li',
	editing: false,
	classNameBindings: ['todo.completed', 'editing'],
	// regexForCostString: '(/^(\d*\.)?\d+g\/(\d*\.)?\d+$/g)',

	costPerKg: computed('todo.title', function() {
		const regexForCostString = (/^(\d*\.)?\d+g\/(\d*\.)?\d+$/g);
		const getRegexMatch = this.get('todo.title').match(regexForCostString);
		if (!!getRegexMatch) {
			const extractedData = getRegexMatch[0].split('g/');
			const costPer100g = (extractedData[1]/extractedData[0])*100;
			return `₹ ${costPer100g}/100g`;
		}
		return;
	}),

	actions: {
		startEditing() {
			this.onStartEdit();
			this.set('editing', true);
			scheduleOnce('afterRender', this, 'focusInput');
		},

		doneEditing(todoTitle) {
			if (!this.editing) { return; }
			if (isBlank(todoTitle)) {
				this.send('removeTodo');
			} else {
				this.set('todo.title', todoTitle.trim());
				this.set('editing', false);
				this.onEndEdit();
			}
		},

		handleKeydown(e) {
			if (e.keyCode === 13) {
				e.target.blur();
			} else if (e.keyCode === 27) {
				this.set('editing', false);
			}
		},

		toggleCompleted(e) {
			let todo = this.todo;
			set(todo, 'completed', e.target.checked);
			this.repo.persist();
		},

		removeTodo() {
			this.repo.delete(this.todo);
		}
	},

	focusInput() {
		this.element.querySelector('input.edit').focus();
	}
});
