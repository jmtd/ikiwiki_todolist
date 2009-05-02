#!/usr/bin/perl
# Markdown markup language
package IkiWiki::Plugin::jonlist;

use warnings;
use strict;
use IkiWiki 3.00;

sub import {
    add_underlay("javascript");
    hook(type => "htmlize", id => "jonlist", call => \&htmlize);
    hook(type => "pagetemplate", id => "jonlist", call => \&pagetemplate);
    hook(type => "format", id => "jonlist", call => \&format);


}

# for now, we will just pass the content straight through
sub htmlize () {
    my %params=@_;
    my $content = $params{content};
    my $retstr = "";
    foreach my $line (split("\n", $content)) {
        $retstr .= "<li>$line</li>";
    }
    return "<ul id=\"mainlist\">$retstr</ul>";
}

# add a template for our javascript whatsit
sub pagetemplate () {
    my %params=@_;
	my $page=$params{page};
    my $template = $params{template};
    my $cgiurl = $config{cgiurl};
    my $url = urlto("outliner.js", $page, 1);
    my $doohicky = "<script lang=\"text/javascript\">
	cgiurl = \"$cgiurl\";
    </script>
    <script type=\"text/javascript\" src=\"$url\" ></script>
";

    my $jonplugin = "jonvar";
    if ($page !~ /.*\/\Q$jonplugin\E$/ ) { 
        $template->param(have_actions => 1);
        $template->param(jonvar => $doohicky);
    }
}

# thanks to relativedate
sub format (@) {
        my %params=@_;

        if (! ($params{content}=~s!^(<body>)!$1.include_javascript($params{page}
)!em)) {
                # no </body> tag, probably in preview mode
                $params{content}=include_javascript($params{page}, 1).$params{co
ntent};
        }
        return $params{content};
}

# thanks to relativedate
sub include_javascript ($;$) {
        my $page=shift;
        my $absolute=shift;
        
        return '<script src="'.urlto("outliner.js", $page, $absolute).
                '" type="text/javascript" charset="utf-8"></script>'."\n";
}


1
