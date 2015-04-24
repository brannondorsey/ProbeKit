// Languages: name (local), name_en, name_fr, name_es, name_de
@name: '[name_en]';

// Fonts //
@sans: 'Open Sans Regular' , 'Source Sans Pro Regular';
@sans_italic: 'Open Sans Italic', 'Source Sans Pro Italic';
@sans_bold: 'Open Sans Bold', 'Source Sans Pro Semibold';

// Common Colors //
@land: #fff;
@water: #def0fb;
@road: #909090;
@building: #dfdfdf;
@road_name: #444;

@thin_line: 0.5;
@min_padding: 20;

Map { background-color: @land; }

// Political boundaries //

#admin[admin_level=2][maritime=0] {
  line-join: round;
  line-color: #575765;
  line-width: @thin_line;
  [zoom>=6] { line-width: 2; }
  [zoom>=8] { line-width: 4; }
  [disputed=1] { line-dasharray: 4,4; }
}

// Places //
#country_label[zoom>=3] {
  text-name: @name;
  text-face-name: @sans_bold;
  text-fill: #66a;
  text-size: 12;
  [zoom>=3][scalerank=1],
  [zoom>=4][scalerank=2],
  [zoom>=5][scalerank=3],
  [zoom>=6][scalerank>3] {
    text-size: 14;
  }
  [zoom>=4][scalerank=1],
  [zoom>=5][scalerank=2],
  [zoom>=6][scalerank=3],
  [zoom>=7][scalerank>3] {
    text-size: 16;
  }
}

#country_label_line { line-color: fadeout(#66a,75%); }

#place_label[localrank<=2] {
  [type='city'][zoom<=15] {
    text-name: @name;
    text-face-name: @sans_bold;
    text-fill: #444;
    text-size: 16;
    [zoom>=10] { text-size: 18; }
    [zoom>=12] { text-size: 24; }
  }
  [type='town'][zoom<=17] {
    text-name: @name;
    text-face-name: @sans;
    text-fill: #333;
    text-size: 14;
    [zoom>=10] { text-size: 16; }
    [zoom>=12] { text-size: 20; }
  }
  [type='village'] {
    text-name: @name;
    text-face-name: @sans;
    text-fill: #444;
    text-size: 12;
    [zoom>=12] { text-size: 14; }
    [zoom>=14] { text-size: 18; }
  }
  [type='hamlet'],
  [type='suburb'],
  [type='neighbourhood'] {
    text-name: @name;
    text-face-name: @sans;
    text-fill: #666;
    text-size: 16;
    
    [zoom>=15] { text-size: 18; }
    [zoom>=14] { text-size: 20; }
    [zoom>=16] { text-size: 24; }
  }
}

// Water Features //

#water {
  polygon-fill: @water;
  polygon-gamma: 0.6;
}

#water_label {
  [zoom<=13],  // automatic area filtering @ low zooms
  [zoom>=14][area>500000],
  [zoom>=16][area>10000],
  [zoom>=17] {
    text-name: @name;
    text-face-name: @sans_italic;
    text-fill: darken(@water, 30%);
    text-size: 13;
    text-wrap-width: 100;
    text-wrap-before: true;
  }
}

#waterway {
  [type='river'],
  [type='canal'] {
    line-color: @water;
    line-width: 0.5;
    [zoom>=12] { line-width: 1; }
    [zoom>=14] { line-width: 2; }
    [zoom>=16] { line-width: 3; }
  }
  [type='stream'] {
    line-color: @water;
    line-width: 0.5;
    [zoom>=14] { line-width: 1; }
    [zoom>=16] { line-width: 2; }
    [zoom>=18] { line-width: 3; }
  }
}

// Roads & Railways //

#tunnel { opacity: 0.5; }

#building {
  polygon-fill: @building;
}

#road_label{
  
  [class='motorway'] {
    
    [zoom>=14] {
      text-name: @name;
      text-face-name: @sans;
      text-repeat-distance: 200;
      text-fill: @road_name;
      text-size: 14; 
      text-min-padding: @min_padding;
    }
    [zoom>=15] { text-size: 15; }
    [zoom>=16] { text-size: 18; }
  }
  
  [class='main'] {   
      [zoom>=16] { 
        text-name: @name;
        text-face-name: @sans;
        text-repeat-distance: 120;
        text-fill: @road_name;
        text-size: 16; 
        text-min-padding: @min_padding;
      }
   }
  
  [class='street'],
  [class='street_limited']{
    
     [zoom>=17] {
      text-name: @name;
      text-face-name: @sans;
      text-repeat-distance: 100;
      text-fill: @road_name;
      text-size: 12; 
      text-min-padding: @min_padding;
    }
   }
}
  
#road,
#tunnel,
#bridge {
  ['mapnik::geometry_type'=2] {
    line-color: @road;
    line-width: 1.0;
    opacity: 0.8;
    [class='motorway'],
    [class='main'] {
      [zoom>=10] { line-width: @thin_line; }
      [zoom>=12] { line-width: @thin_line; }
      [zoom>=14] { line-width: @thin_line; }
      [zoom>=16] { line-width: @thin_line; }
    }
    [class='street'],
    [class='street_limited'] {
      [zoom>=14] { line-width: @thin_line; }
      [zoom>=16] { line-width: @thin_line; }
    }
    [class='street_limited'] { line-dasharray: 4,1; }
  }
}

#poi_label {
   
}
