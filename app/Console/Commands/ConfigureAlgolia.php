<?php

namespace App\Console\Commands;

use Algolia\AlgoliaSearch\Api\SearchClient;
use Illuminate\Console\Command;
use Laravel\Scout\EngineManager;

class ConfigureAlgolia extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'configure:algolia';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configure Algolia Settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $client = SearchClient::create(
            config('scout.algolia.id'),
            config('scout.algolia.secret')
        );
        $index = $client->setSettings(
            config('scout.prefix') . '_user_infos',
            ['attributesForFaceting' => ['status', 'role_name', 'title_name', 'department_name', 'section_name', 'division_name'],
            ]
        );

        $this->info('Algolia filterable attributes set.');
    }
}
