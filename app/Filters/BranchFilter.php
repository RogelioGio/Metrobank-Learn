<?php

namespace App\Filters;

use Illuminate\Http\Request;

class BranchFilter{
    protected $allowedParamaters = [
        'city_id' => ['eq']
    ];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'gt' => '>',
        'lte' => '<=',
        'gte' => '>=',
    ];

    public function transform(Request $request){
        $eloQuery = [];

        foreach($this->allowedParamaters as $parm => $operators){
            $query = $request->query($parm);

            if(!isset($query)){
                continue;
            }

            foreach ($operators as $operator){
                if(isset($query[$operator])){
                    $eloQuery[] = [$parm, $this->operatorMap[$operator], $query[$operator]];
                }
            }
        }

        return $eloQuery;
    }
}
