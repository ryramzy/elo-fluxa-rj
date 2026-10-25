param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$GcloudArguments
)

# Scope every command to this app without changing the user's global defaults.
if (-not $GcloudArguments) { $GcloudArguments = @('config', 'list') }
& gcloud --configuration=elo-fluxa-rj --project=gen-lang-client-0976465403 @GcloudArguments
exit $LASTEXITCODE
