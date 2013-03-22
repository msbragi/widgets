<div id='calendar'></div>
<div id='loading' style='display:none'>loading...</div>
<script>
$(document).ready(function() {
	$('#calendar').fullCalendar({
		header: {
			left: 'title',
			center: '',
			right: 'today agendaDay,agendaWeek,month prev,next'
		},
		firstHour: 8,
		weekMode: 'variable',
		editable: true,
		theme: false,
		axisFormat: 'HH:mm',
		allDaySlot: true,
		slotMinutes: 30,
		events: "<?php echo $this->Html->url('/test/getDays'); ?>",
		eventDrop: function(event, delta) {
			alert(event.title + ' was moved ' + delta + ' days\n' +
				'(should probably update your database)');
		},
		loading: function(bool) {
			if (bool) $('#loading').show();
			else $('#loading').hide();
		}
	});
});
</script>