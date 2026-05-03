<?php

namespace App\Filters;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CourseFilter{
    protected $allowedParamaters = [
        'type_id' => ['eq'],
        'training_type' => ['eq'],
        'category_id' => ['eq'],
    ];

    protected $parameterMap = [
        'type_id' => 'types',
        'category_id' => 'categories'
    ];

    protected $whereMap = ['training_type'];

    protected $operatorMap = [
        'eq' => '=',
        // 'lt' => '<',
        // 'gt' => '>',
        // 'lte' => '<=',
        // 'gte' => '>=',
    ];

    public function transform($builder, Request $request){
        $eloQuery = [];

        foreach($this->allowedParamaters as $parm => $operators){
            $query = $request->query($parm);

            if(!isset($query)){
                continue;
            }

            foreach ($operators as $operator){
                if(isset($query[$operator])){
                    if(in_array($parm, $this->whereMap)){
                        $builder->where($parm, $this->operatorMap[$operator], $query[$operator]);
                        continue;
                    }
                    $builder->whereHas($this->parameterMap[$parm], function($queryy) use($operator, $parm, $query){
                        $queryy->where($parm, $this->operatorMap[$operator], $query[$operator]);
                    });
                }
            }
        }
        return $builder;
    }
}