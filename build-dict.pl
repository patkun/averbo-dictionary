#! /opt/local/bin/perl5.16
use utf8;
use strict;
use Encode;
use DBI;

my $result = "";

my $dbname = "AVERBO";

open(DICTFILE, 'DICTPAGE.txt') or die "Can't read file 'filename' [$!]\n";

my $dbh = DBI->connect("dbi:Pg:dbname=$dbname", '', '', {AutoCommit => 0});
$dbh->do("DROP TABLE IF EXISTS averbodict;");
$dbh->do("CREATE TABLE averbodict (id SERIAL PRIMARY KEY, lemma TEXT, index TSVECTOR, extra TEXT, en TEXT)");
$dbh->commit();

while (<DICTFILE>) {
  chomp;
  $_ =~ s/(?=[[:word:]])"([[:word:]]+)"(?![[:word:]])/‘$1’/g;
  $_ =~ s/'/’/g;
  $_ =~ /^#([[:graph:]][[:print:]]*[[:graph:]])  ([[:graph:]][[:print:]]*[[:graph:]]) {2,}\[[A-Z]{5}\] :: \|*([^| ][[:print:]]*[[:graph:]])$/;
  #print "$1 - $3\n";
  my $lemma = $1;
  my $idxlemma = $lemma;
  $idxlemma =~ s/\([a-z]{1,5}\.\) //g;
  $lemma = $dbh->quote($lemma);
  $idxlemma = $dbh->quote($idxlemma);
  my $extra = $dbh->quote(lc($2));
  my $en = $dbh->quote($3);
  $dbh->do("INSERT INTO averbodict (lemma, index, extra, en) VALUES ($lemma, to_tsvector('simple',$idxlemma), $extra, $en);");
  $dbh->commit();
}
close(DICTFILE);

$dbh->commit();
$dbh->do("CREATE INDEX averbodict_idx ON averbodict USING gin(index);");
$dbh->commit();

$dbh->disconnect();
