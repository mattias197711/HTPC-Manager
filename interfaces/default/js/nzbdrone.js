$(document).ready(function () {
    moment.locale('no', {
        calendar : {
            lastDay : '[Yesterday at] LT',
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            lastWeek : '[last] dddd [at] LT',
            nextWeek : 'dddd [at] LT',
            sameElse : 'L'
        }
    });
    moment().format();
    $(window).trigger('hashchange')
    profile();
    loadShows();
    history();
    calendar();
    //loadLogs();

    $('#add_show_button').click(function () {
        $(this).attr('disabled', true);
        //searchTvDb($('#add_show_name').val())
    });

    $('#add_tvdbid_button').click(function () {
        addShow($('#add_show_select').val());
    });

    $('#cancel_show_button').click(function () {
        //cancelAddShow();
    });

});

// Global for quality profiles
var qlty; 

function loadShows() {
    $.ajax({
        url: WEBDIR + 'nzbdrone/Series',
        type: 'get',
        dataType: 'json',
        success: function (result) {
            if (result.length === 0) {
                var row = $('<tr>');
                row.append($('<td>').html('No shows found'));
                $('#tvshows_table_body').append(row);
            }
            $.each(result, function (showname, tvshow) {
                //console.log(result)
                var name = $('<a>').attr('href', WEBDIR + 'nzbdrone/Series/' + tvshow.tvdbId).text(tvshow.title);
                var row = $('<tr>');
                // Check the global var as nzbdrone dont have quality name only a id.
                $.each(qlty, function (i, q) {
                    if (tvshow.qualityProfileId == q.id) {
                        qname = q.name;
                    }
                });
                if (tvshow.nextAiring) {
                  console.log('its there');
                  nextair = moment(tvshow.nextAiring).calendar();
                } else {
                  nextair = ''
                }
                row.append(
                $('<td>').html(name),
                $('<td>').html(nzbdroneStatusLabel(tvshow.status)),
                $('<td>').html(nextair),
                $('<td>').html(tvshow.network),
                $('<td>').html(nzbdroneStatusLabel(qname))
                );
                $('#tvshows_table_body').append(row);
            });
            $('#tvshows_table_body').parent().trigger('update');
            $('#tvshows_table_body').parent().trigger("sorton", [
                [
                    [0, 0]
                ]
            ]);
        }
    });
}

function nzbdroneStatusIcon(iconText, white){
  var text =[
    'downloaded',
    'continuing',
    'snatched',
    'unaired',
    'archived',
    'skipped'
  ];
  var icons = [
    'icon-download-alt',
    'icon-repeat',
    'icon-share-alt',
    'icon-time',
    'icon-lock',
    'icon-fast-forward'
  ];

  if (text.indexOf(iconText) != -1) {
    var icon = $('<i>').addClass(icons[text.indexOf(iconText)]);
    if (white == true) {
      icon.addClass('icon-white');
    }
    return icon;
  }
  return '';
}

function nzbdroneStatusLabel(text){
  var statusOK = ['continuing', 'downloaded', 'HD', 'HD-720p', 'HD-1080p', 'WEBDL-1080p'];
  var statusInfo = ['snatched', 'SD'];
  var statusError = ['ended'];
  var statusWarning = ['skipped'];
  //console.log(text);

  var label = $('<span>').addClass('label').text(text);

  if (statusOK.indexOf(text) != -1) {
    label.addClass('label-success');
  }
  else if (statusInfo.indexOf(text) != -1) {
    label.addClass('label-info');
  }
  else if (statusError.indexOf(text) != -1) {
    label.addClass('label-important');
  }
  else if (statusWarning.indexOf(text) != -1) {
    label.addClass('label-warning');
  }

  var icon = nzbdroneStatusIcon(text, true);
  if (icon != '') {
    label.prepend(' ').prepend(icon);
  }
  //console.log('label')
  //console.log(label)
  return label;
}

function profile(qualityProfileId) {
    $.get(WEBDIR + 'nzbdrone/Profile', function(result) {
      //console.log(result)
      qlty = result
      /*
        $.each(result, function(i, q) {
            if (qualityProfileId === q.id) {
              //console.log('its a match')
                return q.name;
            }
        });
    */
    });

}

function history() {
    $.getJSON(WEBDIR + 'nzbdrone/History', function (result) {
        console.log(result);
        $.each(result.records, function (i, log) {
            var row = $('<tr>');
            row.append(
            $('<td>').text(moment(log.date).calendar()),
            //$('<td>').text(log.eventType), // descibes the action
            //$('<td>').text(log.sourceTitle),
            $('<td>').text(log.series.title),
            $('<td>').text(log.episode.title),
            $('<td>').html(nzbdroneStatusLabel(log.series.status)),
            $('<td>').html(nzbdroneStatusLabel(log.quality.quality.name))
            );

            $('#history_table_body').append(row);
        });
    });
}

function calendar() {
    $.getJSON(WEBDIR + 'nzbdrone/Calendar', function (result) {
        console.log(result);
        $.each(result, function (i, cal) {
          console.log(cal)
            var row = $('<tr>'); 
            row.append(
            $('<td>').text(cal.series.title),
            $('<td>').text(cal.title),
            $('<td>').text(moment(cal.airDateUtc).calendar())
            )
            
            // cal.airDateUtc // airdate
            // cal.overview // summary
            // cal.series.title // show title
            // cal.title // episode title
            // cal.profile.value.name // Quality name
            
            $('#calendar_table_body').append(row);
        });

    });
}
