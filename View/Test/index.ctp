<div id='calendar'></div>
<div id='loading' style='display:none'>loading...</div>
<a href="#">Test</a>
<script>
$(function() {
	var plgFcRoot = '<?php echo $this->Html->url('/'); ?>' + "full_calendar";

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
		events: plgFcRoot + "/events/feed",
		eventRender: function(event, element) {
        	element.qtip({
				content: {
					text: event.details.replace(/\r\n?|\n/g, '<br />'),
					title: {
						text: $.fullCalendar.formatDate(event.start,'ddd, dd MMM yyyy'),
						button: false
					}
				},
				style: {
					classes: 'qtip-bootstrap'
				},
				position: {
					my: 'center right',
					at: 'center left'
				}
        	});
		},
		eventDragStart: function(event) {
			$(this).qtip("destroy");
		},
		eventResizeStart: function(event) {
			$(this).qtip("destroy");
		},
		loading: function(bool) {
			if (bool) {
				 $('#loading').show();
			} else {
				$('#loading').hide();
			}
		}
	});
});
</script>