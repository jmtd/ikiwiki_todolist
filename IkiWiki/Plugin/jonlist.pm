#!/usr/bin/perl
# Markdown markup language
package IkiWiki::Plugin::jonlist;

use warnings;
use strict;
use IkiWiki 3.00;

sub import {
    hook(type => "htmlize", id => "jonlist", call => \&htmlize);
    hook(type => "pagetemplate", id => "jonlist", call => \&pagetemplate);
}

# for now, we will just pass the content straight through
sub htmlize () {
    my %params=@_;
    my $content = $params{content};
    return "$content";
}

# add a template for our javascript whatsit
sub pagetemplate () {
    my %params=@_;
	my $page=$params{page};
    my $template = $params{template};
    my $cgiurl = $config{cgiurl};
    my $doohicky = "<script lang=\"text/javascript\">
	// hello world
	cgiurl = \"$cgiurl\";
    </script>";

    my $jonplugin = "jonvar";
    if ($page !~ /.*\/\Q$jonplugin\E$/ ) { 
        $template->param(have_actions => 1);
        $template->param(jonvar => $doohicky);
    }
}

1
