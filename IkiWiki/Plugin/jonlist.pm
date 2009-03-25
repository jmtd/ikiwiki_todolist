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

sub pagetemplate () {
    my %params=@_;
    my $template = $params{template};
}

1
